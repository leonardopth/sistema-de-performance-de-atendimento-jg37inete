migrate(
  (app) => {
    try {
      app.findFirstRecordByData('report_schedules', 'enabled', true)
      return
    } catch (_) {}

    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'leonardopth@gmail.com')
      const col = app.findCollectionByNameOrId('report_schedules')
      const record = new Record(col)
      record.set('enabled', true)
      record.set('day_of_week', 'monday')
      record.set('configured_by', admin.id)
      app.save(record)
    } catch (_) {}
  },
  (app) => {},
)
