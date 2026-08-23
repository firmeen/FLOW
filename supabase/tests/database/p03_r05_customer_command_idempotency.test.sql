begin;

create extension if not exists pgtap with schema extensions;

select plan(20);

select ok(
  to_regclass('private.customer_command_idempotency') is not null,
  'private customer command idempotency table exists'
);
select ok(
  to_regprocedure('private.acquire_customer_command_idempotency(text,text,text)') is not null,
  'atomic customer idempotency acquisition function exists'
);
select ok(
  to_regprocedure('private.complete_customer_command_idempotency(uuid,integer,integer,jsonb,text,uuid)') is not null,
  'atomic customer idempotency completion function exists'
);
select ok(
  has_function_privilege(
    'flow_customer_runtime',
    'private.acquire_customer_command_idempotency(text,text,text)',
    'EXECUTE'
  ),
  'customer runtime can acquire scoped idempotency identity'
);
select ok(
  has_function_privilege(
    'flow_customer_runtime',
    'private.complete_customer_command_idempotency(uuid,integer,integer,jsonb,text,uuid)',
    'EXECUTE'
  ),
  'customer runtime can complete its scoped idempotency identity'
);
select ok(
  not has_function_privilege(
    'public',
    'private.acquire_customer_command_idempotency(text,text,text)',
    'EXECUTE'
  ),
  'public cannot acquire customer idempotency records'
);
select ok(
  not has_function_privilege(
    'anon',
    'private.acquire_customer_command_idempotency(text,text,text)',
    'EXECUTE'
  ),
  'anon cannot acquire customer idempotency records'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'private.acquire_customer_command_idempotency(text,text,text)',
    'EXECUTE'
  ),
  'authenticated cannot acquire customer idempotency records'
);
select ok(
  not has_function_privilege(
    'flow_customer_entry',
    'private.acquire_customer_command_idempotency(text,text,text)',
    'EXECUTE'
  ),
  'customer entry role cannot acquire command idempotency records'
);
select ok(
  not has_table_privilege('flow_customer_runtime', 'private.customer_command_idempotency', 'SELECT'),
  'customer runtime has no direct idempotency table read authority'
);
select ok(
  not has_table_privilege('flow_customer_runtime', 'private.customer_command_idempotency', 'INSERT'),
  'customer runtime has no direct idempotency table insert authority'
);
select ok(
  not has_table_privilege('flow_customer_runtime', 'private.customer_command_idempotency', 'UPDATE'),
  'customer runtime has no direct idempotency table update authority'
);

-- pgTAP access is test-only and rolls back with this transaction.
grant usage on schema extensions to flow_customer_runtime;

set local role flow_customer_runtime;
select set_config('app.tenant_id', '00000000-0000-0000-0000-0000000000a1', true);
select set_config('app.restaurant_id', '00000000-0000-0000-0000-0000000000a2', true);
select set_config('app.branch_id', '00000000-0000-0000-0000-0000000000a3', true);
select set_config('app.table_id', '00000000-0000-0000-0000-0000000000a5', true);
select set_config('app.customer_capability_id', '70000000-0000-4000-8000-000000000081', true);
select set_config('app.table_session_id', '', true);
select set_config('app.actor_id', '', true);

select extensions.is(
  (
    select acquisition
    from private.acquire_customer_command_idempotency(
      'CART_ADD_ITEM',
      repeat('a', 64),
      repeat('b', 64)
    )
  ),
  'OWNER'::text,
  'first scoped request becomes execution owner'
);

select extensions.ok(
  private.complete_customer_command_idempotency(
    (
      select record_id
      from private.acquire_customer_command_idempotency(
        'CART_ADD_ITEM',
        repeat('a', 64),
        repeat('b', 64)
      )
    ),
    200,
    1,
    '{"cartId":"71000000-0000-4000-8000-000000000081"}'::jsonb,
    'cart',
    '71000000-0000-4000-8000-000000000081'
  ),
  'execution owner can finalize one replayable success'
);

select extensions.is(
  (
    select acquisition
    from private.acquire_customer_command_idempotency(
      'CART_ADD_ITEM',
      repeat('a', 64),
      repeat('b', 64)
    )
  ),
  'REPLAY'::text,
  'identical retry replays committed success'
);

select extensions.is(
  (
    select response_status
    from private.acquire_customer_command_idempotency(
      'CART_ADD_ITEM',
      repeat('a', 64),
      repeat('b', 64)
    )
  ),
  200,
  'replay preserves the original success status'
);

select extensions.is(
  (
    select acquisition
    from private.acquire_customer_command_idempotency(
      'CART_ADD_ITEM',
      repeat('a', 64),
      repeat('c', 64)
    )
  ),
  'MISMATCH'::text,
  'same scoped key with another fingerprint conflicts without execution'
);

select set_config('app.customer_capability_id', '70000000-0000-4000-8000-000000000082', true);
select extensions.is(
  (
    select acquisition
    from private.acquire_customer_command_idempotency(
      'CART_ADD_ITEM',
      repeat('a', 64),
      repeat('b', 64)
    )
  ),
  'OWNER'::text,
  'same raw key digest is independent in another capability scope'
);

reset role;

select is(
  (select count(*)::bigint from private.customer_command_idempotency),
  2::bigint,
  'two capability scopes persist two independent request identities'
);
select is(
  (
    select count(*)::bigint
    from private.customer_command_idempotency
    where status = 'SUCCEEDED'
  ),
  1::bigint,
  'only the completed request is marked succeeded'
);

select * from finish();
rollback;
