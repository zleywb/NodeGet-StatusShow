export const listAgentUuids = c =>
  c.call('nodeget-server_list_all_agent_uuid', {}).then(r => r?.uuids || [])

export const staticDataMulti = (c, uuids, fields) =>
  c.call('agent_static_data_multi_last_query', { uuids, fields })

export const dynamicSummaryMulti = (c, uuids, fields) =>
  c.call('agent_dynamic_summary_multi_last_query', { uuids, fields })

export const kvGetMulti = (c, items) => c.call('kv_get_multi_value', { namespace_key: items })
