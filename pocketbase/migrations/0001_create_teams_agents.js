migrate(
  (app) => {
    const teams = new Collection({
      name: 'teams',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_teams_name ON teams (name)'],
    })
    app.save(teams)

    const agents = new Collection({
      name: 'agents',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'text' },
        {
          name: 'team_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('teams').id,
          maxSelect: 1,
        },
        {
          name: 'avatar',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png'],
        },
        { name: 'status', type: 'select', values: ['active', 'inactive'], maxSelect: 1 },
        { name: 'role', type: 'select', values: ['agent', 'senior', 'lead'], maxSelect: 1 },
        { name: 'total_conversations', type: 'number', onlyInt: true },
        { name: 'conversion_rate', type: 'number' },
        { name: 'avg_response_time', type: 'number', onlyInt: true },
        { name: 'satisfaction_score', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_agents_team ON agents (team_id)'],
    })
    app.save(agents)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('agents'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('teams'))
    } catch (_) {}
  },
)
