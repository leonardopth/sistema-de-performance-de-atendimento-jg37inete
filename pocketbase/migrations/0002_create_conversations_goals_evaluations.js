migrate(
  (app) => {
    const agentsId = app.findCollectionByNameOrId('agents').id
    const teamsId = app.findCollectionByNameOrId('teams').id

    const conversations = new Collection({
      name: 'conversations',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'agent_id',
          type: 'relation',
          required: true,
          collectionId: agentsId,
          maxSelect: 1,
        },
        { name: 'customer_name', type: 'text' },
        { name: 'status', type: 'select', values: ['open', 'closed', 'lost'], maxSelect: 1 },
        {
          name: 'channel',
          type: 'select',
          values: ['whatsapp', 'email', 'chat', 'phone'],
          maxSelect: 1,
        },
        { name: 'started_at', type: 'date' },
        { name: 'duration', type: 'number', onlyInt: true },
        {
          name: 'outcome',
          type: 'select',
          values: ['converted', 'not_converted', 'pending'],
          maxSelect: 1,
        },
        { name: 'satisfaction', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_conversations_agent ON conversations (agent_id)'],
    })
    app.save(conversations)

    const goals = new Collection({
      name: 'goals',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'agent_id', type: 'relation', collectionId: agentsId, maxSelect: 1 },
        { name: 'team_id', type: 'relation', collectionId: teamsId, maxSelect: 1 },
        {
          name: 'type',
          type: 'select',
          values: ['conversion', 'satisfaction', 'response_time'],
          maxSelect: 1,
        },
        { name: 'target', type: 'number' },
        { name: 'current', type: 'number' },
        { name: 'period', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['active', 'completed', 'overdue'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_goals_agent ON goals (agent_id)'],
    })
    app.save(goals)

    const evaluations = new Collection({
      name: 'evaluations',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'agent_id',
          type: 'relation',
          required: true,
          collectionId: agentsId,
          maxSelect: 1,
        },
        { name: 'evaluator', type: 'text' },
        { name: 'score', type: 'number', onlyInt: true },
        { name: 'feedback', type: 'text' },
        {
          name: 'category',
          type: 'select',
          values: ['quality', 'efficiency', 'communication'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_evaluations_agent ON evaluations (agent_id)'],
    })
    app.save(evaluations)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('evaluations'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('goals'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('conversations'))
    } catch (_) {}
  },
)
