migrate(
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!usersCol.fields.getByName('role')) {
      usersCol.fields.add(
        new SelectField({
          name: 'role',
          values: ['admin', 'gestor', 'supervisor', 'agente'],
          maxSelect: 1,
        }),
      )
    }
    usersCol.listRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    usersCol.viewRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    usersCol.updateRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    app.save(usersCol)

    var allUsers = app.findRecordsByFilter('_pb_users_auth_', 'id != ""', '-created', 1000, 0)
    for (var i = 0; i < allUsers.length; i++) {
      if (!allUsers[i].getString('role')) {
        allUsers[i].set('role', 'agente')
        app.save(allUsers[i])
      }
    }

    try {
      var admin = app.findAuthRecordByEmail('_pb_users_auth_', 'leonardopth@gmail.com')
      admin.set('role', 'admin')
      app.save(admin)
    } catch (_) {}

    var agentsId = app.findCollectionByNameOrId('agents').id
    var reportsCol = app.findCollectionByNameOrId('reports')
    if (!reportsCol.fields.getByName('agent')) {
      reportsCol.fields.add(
        new RelationField({
          name: 'agent',
          collectionId: agentsId,
          maxSelect: 1,
        }),
      )
    }
    reportsCol.listRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor' || @request.auth.role = 'supervisor')"
    reportsCol.viewRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor' || @request.auth.role = 'supervisor')"
    reportsCol.createRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor')"
    reportsCol.updateRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor')"
    reportsCol.deleteRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor')"
    app.save(reportsCol)
    reportsCol.addIndex('idx_reports_agent', false, 'agent', '')
    app.save(reportsCol)

    var goalsCol = app.findCollectionByNameOrId('goals')
    goalsCol.createRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor')"
    goalsCol.updateRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor')"
    goalsCol.deleteRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor')"
    app.save(goalsCol)
  },
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    usersCol.fields.remove('role')
    usersCol.listRule = 'id = @request.auth.id'
    usersCol.viewRule = 'id = @request.auth.id'
    usersCol.updateRule = 'id = @request.auth.id'
    app.save(usersCol)

    var reportsCol = app.findCollectionByNameOrId('reports')
    reportsCol.fields.remove('agent')
    reportsCol.removeIndex('idx_reports_agent')
    reportsCol.listRule = "@request.auth.id != ''"
    reportsCol.viewRule = "@request.auth.id != ''"
    reportsCol.createRule = "@request.auth.id != ''"
    reportsCol.updateRule = "@request.auth.id != ''"
    reportsCol.deleteRule = "@request.auth.id != ''"
    app.save(reportsCol)

    var goalsCol = app.findCollectionByNameOrId('goals')
    goalsCol.createRule = "@request.auth.id != ''"
    goalsCol.updateRule = "@request.auth.id != ''"
    goalsCol.deleteRule = "@request.auth.id != ''"
    app.save(goalsCol)
  },
)
