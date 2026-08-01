onRecordAfterUpdateSuccess((e) => {
  var record = e.record
  var current = record.getFloat('current')
  var target = record.getFloat('target')
  var prevCurrent = record.original().getFloat('current') || 0

  if (current >= target && prevCurrent < target) {
    try {
      var goal = $app.findRecordById('goals', record.id)
      goal.set('status', 'completed')
      $app.save(goal)

      var goalTitle = record.getString('title')
      var agentId = record.getString('agent_id')
      var teamId = record.getString('team_id')
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

      var message = 'A meta "' + goalTitle + '" foi atingida'
      if (agentName) message += ' por ' + agentName
      else if (teamName) message += ' pela equipe ' + teamName
      message += '.'

      var users = $app.findRecordsByFilter('users', 'email != ""', '-created', 1000, 0)
      var notifCol = $app.findCollectionByNameOrId('notifications')

      for (var i = 0; i < users.length; i++) {
        var notif = new Record(notifCol)
        notif.set('title', 'Meta atingida')
        notif.set('message', message)
        notif.set('type', 'goal_completed')
        notif.set('read', false)
        notif.set('recipient', users[i].id)
        if (agentId) notif.set('related_agent', agentId)
        notif.set('related_goal', record.id)
        $app.save(notif)
      }

      if (agentId) {
        var hasAchievement = false
        try {
          $app.findFirstRecordByFilter(
            'achievements',
            'agent_id = "' + agentId + '" && title = "Meta Batida"',
          )
          hasAchievement = true
        } catch (_) {}

        if (!hasAchievement) {
          var achCol = $app.findCollectionByNameOrId('achievements')
          var ach = new Record(achCol)
          ach.set('agent_id', agentId)
          ach.set('title', 'Meta Batida')
          ach.set('description', 'Concluiu uma meta estabelecida')
          ach.set('icon', '🎯')
          ach.set('category', 'goal')
          ach.set('awarded_at', new Date().toISOString())
          $app.save(ach)

          for (var j = 0; j < users.length; j++) {
            var badgeNotif = new Record(notifCol)
            badgeNotif.set('title', 'Nova conquista!')
            badgeNotif.set('message', (agentName || 'Agente') + ' conquistou "Meta Batida" 🎯')
            badgeNotif.set('type', 'badge_earned')
            badgeNotif.set('read', false)
            badgeNotif.set('recipient', users[j].id)
            badgeNotif.set('related_agent', agentId)
            $app.save(badgeNotif)
          }
        }
      }
    } catch (err) {
      $app.logger().error('goal completion hook failed', 'error', String(err))
    }
  }

  return e.next()
}, 'goals')
