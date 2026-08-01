migrate(
  (app) => {
    const usersId = '_pb_users_auth_'

    const reportSchedules = new Collection({
      name: 'report_schedules',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'enabled', type: 'bool' },
        {
          name: 'day_of_week',
          type: 'select',
          values: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          maxSelect: 1,
        },
        {
          name: 'configured_by',
          type: 'relation',
          required: true,
          collectionId: usersId,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [],
    })
    app.save(reportSchedules)

    const reports = new Collection({
      name: 'reports',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'period_start', type: 'date', required: true },
        { name: 'period_end', type: 'date', required: true },
        {
          name: 'report_type',
          type: 'select',
          values: ['weekly', 'monthly', 'manual'],
          maxSelect: 1,
        },
        { name: 'summary_data', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_reports_created ON reports (created)'],
    })
    app.save(reports)

    const goals = app.findCollectionByNameOrId('goals')
    if (!goals.fields.getByName('period_type')) {
      goals.fields.add(
        new SelectField({
          name: 'period_type',
          values: ['monthly', 'quarterly', 'custom'],
          maxSelect: 1,
        }),
      )
    }
    if (!goals.fields.getByName('period_start')) {
      goals.fields.add(new DateField({ name: 'period_start' }))
    }
    if (!goals.fields.getByName('period_end')) {
      goals.fields.add(new DateField({ name: 'period_end' }))
    }
    app.save(goals)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('report_schedules'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('reports'))
    } catch (_) {}
    try {
      const goals = app.findCollectionByNameOrId('goals')
      goals.fields.remove('period_type')
      goals.fields.remove('period_start')
      goals.fields.remove('period_end')
      app.save(goals)
    } catch (_) {}
  },
)
