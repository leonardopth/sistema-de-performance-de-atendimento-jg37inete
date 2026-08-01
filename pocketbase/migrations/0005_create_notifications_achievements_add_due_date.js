migrate(
  (app) => {
    const agentsId = app.findCollectionByNameOrId('agents').id
    const goalsId = app.findCollectionByNameOrId('goals').id

    const notifications = new Collection({
      name: 'notifications',
      type: 'base',
      listRule: '@request.auth.id != "" && recipient.id = @request.auth.id',
      viewRule: '@request.auth.id != "" && recipient.id = @request.auth.id',
      createRule: null,
      updateRule: '@request.auth.id != "" && recipient.id = @request.auth.id',
      deleteRule: '@request.auth.id != "" && recipient.id = @request.auth.id',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'message', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['goal_completed', 'goal_overdue', 'badge_earned', 'system'],
          maxSelect: 1,
        },
        { name: 'related_agent', type: 'relation', collectionId: agentsId, maxSelect: 1 },
        { name: 'related_goal', type: 'relation', collectionId: goalsId, maxSelect: 1 },
        { name: 'read', type: 'bool' },
        {
          name: 'recipient',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_notifications_recipient ON notifications (recipient)',
        'CREATE INDEX idx_notifications_read ON notifications (read)',
        'CREATE INDEX idx_notifications_created ON notifications (created)',
      ],
    })
    app.save(notifications)

    const achievements = new Collection({
      name: 'achievements',
      type: 'base',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'agent_id',
          type: 'relation',
          required: true,
          collectionId: agentsId,
          maxSelect: 1,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'icon', type: 'text', required: true },
        {
          name: 'category',
          type: 'select',
          required: true,
          values: ['conversion', 'productivity', 'quality', 'satisfaction', 'goal'],
          maxSelect: 1,
        },
        { name: 'awarded_at', type: 'date', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_achievements_agent ON achievements (agent_id)',
        'CREATE INDEX idx_achievements_category ON achievements (category)',
      ],
    })
    app.save(achievements)

    const goals = app.findCollectionByNameOrId('goals')
    if (!goals.fields.getByName('due_date')) {
      goals.fields.add(new DateField({ name: 'due_date' }))
    }
    app.save(goals)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('notifications'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('achievements'))
    } catch (_) {}
    try {
      const goals = app.findCollectionByNameOrId('goals')
      goals.fields.remove('due_date')
      app.save(goals)
    } catch (_) {}
  },
)
