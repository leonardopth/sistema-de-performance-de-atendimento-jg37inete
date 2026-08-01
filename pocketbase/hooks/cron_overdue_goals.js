cronAdd('overdue_goals_check', '0 8 * * *', () => {
  try {
    var now = new Date()
    var goals = $app.findRecordsByFilter('goals', 'status = "active"', '-created', 500, 0)
    var notifCol = $app.findCollectionByNameOrId('notifications')
    var users = $app.findRecordsByFilter('users', 'email != ""', '-created', 1000, 0)

    for (var i = 0; i < goals.length; i++) {
      var goal = goals[i]
      var dueDateStr = goal.getString('due_date')
      if (!dueDateStr) continue

      var dueDate = new Date(dueDateStr)
      if (dueDate >= now) continue

      var current = goal.getFloat('current')
      var target = goal.getFloat('target')
      if (current >= target) continue

      goal.set('status', 'overdue')
      $app.save(goal)

      var goalTitle = goal.getString('title')
      var agentId = goal.getString('agent_id')
      var teamId = goal.getString('team_id')
      var agentName = ''
      var teamName = ''

      if (agentId) {
        try {
          agentName = $app.findRecordById('agents', agentId).getString('name')
        } catch (_) {}
      }
      if (teamId) {
        try {
          teamName = $app.findRecordById('teams', teamId).getString('name')
        } catch (_) {}
      }

      var message = 'A meta "' + goalTitle + '" nao foi atingida'
      if (agentName) message += ' por ' + agentName
      else if (teamName) message += ' pela equipe ' + teamName
      message += ' dentro do prazo.'

      for (var j = 0; j < users.length; j++) {
        var notif = new Record(notifCol)
        notif.set('title', 'Meta perdida')
        notif.set('message', message)
        notif.set('type', 'goal_overdue')
        notif.set('read', false)
        notif.set('recipient', users[j].id)
        if (agentId) notif.set('related_agent', agentId)
        notif.set('related_goal', goal.id)
        $app.save(notif)
      }
    }
  } catch (err) {
    $app.logger().error('overdue goals check failed', 'error', String(err))
  }
})
