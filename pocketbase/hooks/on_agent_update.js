onRecordAfterUpdateSuccess((e) => {
  var record = e.record

  var cr = record.getFloat('conversion_rate')
  var art = record.getFloat('avg_response_time')
  var tc = record.getInt('total_conversations')
  var ss = record.getFloat('satisfaction_score')

  var prevCr = record.original().getFloat('conversion_rate') || 0
  var prevArt = record.original().getFloat('avg_response_time') || 0
  var prevTc = record.original().getInt('total_conversations') || 0
  var prevSs = record.original().getFloat('satisfaction_score') || 0

  if (cr === prevCr && art === prevArt && tc === prevTc && ss === prevSs) {
    return e.next()
  }

  try {
    var agentId = record.id
    var agentName = record.getString('name')
    var achievementsCol = $app.findCollectionByNameOrId('achievements')
    var notifCol = $app.findCollectionByNameOrId('notifications')
    var users = $app.findRecordsByFilter('users', 'email != ""', '-created', 1000, 0)
    var now = new Date().toISOString()

    var checks = [
      {
        title: 'Mestre da Conversao',
        desc: 'Taxa de conversao acima de 70%',
        icon: '🏆',
        cat: 'conversion',
        pass: cr >= 70,
      },
      {
        title: 'Velocista',
        desc: 'Tempo de resposta medio abaixo de 2 segundos',
        icon: '⚡',
        cat: 'productivity',
        pass: art <= 2,
      },
      {
        title: 'Produtivo',
        desc: 'Mais de 200 conversas atendidas',
        icon: '📈',
        cat: 'productivity',
        pass: tc >= 200,
      },
      {
        title: 'Coracao de Ouro',
        desc: 'Satisfacao do cliente acima de 4.8',
        icon: '😊',
        cat: 'satisfaction',
        pass: ss >= 4.8,
      },
    ]

    for (var i = 0; i < checks.length; i++) {
      var c = checks[i]
      if (!c.pass) continue

      var exists = false
      try {
        $app.findFirstRecordByFilter(
          'achievements',
          'agent_id = "' + agentId + '" && title = "' + c.title + '"',
        )
        exists = true
      } catch (_) {}

      if (!exists) {
        var ach = new Record(achievementsCol)
        ach.set('agent_id', agentId)
        ach.set('title', c.title)
        ach.set('description', c.desc)
        ach.set('icon', c.icon)
        ach.set('category', c.cat)
        ach.set('awarded_at', now)
        $app.save(ach)

        for (var j = 0; j < users.length; j++) {
          var notif = new Record(notifCol)
          notif.set('title', 'Nova conquista!')
          notif.set('message', agentName + ' conquistou "' + c.title + '" ' + c.icon)
          notif.set('type', 'badge_earned')
          notif.set('read', false)
          notif.set('recipient', users[j].id)
          notif.set('related_agent', agentId)
          $app.save(notif)
        }
      }
    }
  } catch (err) {
    $app.logger().error('agent achievement hook failed', 'error', String(err))
  }

  return e.next()
}, 'agents')
