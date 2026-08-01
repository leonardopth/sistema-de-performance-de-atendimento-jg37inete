cronAdd('weekly_report', '0 9 * * *', () => {
  try {
    var schedules = $app.findRecordsByFilter(
      'report_schedules',
      'enabled = true',
      '-created',
      100,
      0,
    )
    if (schedules.length === 0) return

    var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    var today = days[new Date().getDay()]

    var shouldRun = false
    for (var i = 0; i < schedules.length; i++) {
      if (schedules[i].getString('day_of_week') === today) {
        shouldRun = true
        break
      }
    }
    if (!shouldRun) return

    var now = new Date()
    var weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    var agents = $app.findRecordsByFilter('agents', 'email != ""', '-created', 500, 0)
    var totalConv = 0
    var totalConvRate = 0
    var totalRespTime = 0
    var totalSat = 0
    var agentPerf = []

    for (var i = 0; i < agents.length; i++) {
      var a = agents[i]
      totalConv += a.getFloat('total_conversations')
      totalConvRate += a.getFloat('conversion_rate')
      totalRespTime += a.getFloat('avg_response_time')
      totalSat += a.getFloat('satisfaction_score')

      var teamName = ''
      var teamId = a.getString('team_id')
      if (teamId) {
        try {
          var team = $app.findRecordById('teams', teamId)
          teamName = team.getString('name')
        } catch (_) {}
      }

      agentPerf.push({
        id: a.id,
        name: a.getString('name'),
        team: teamName,
        conversations: a.getFloat('total_conversations'),
        conversion_rate: a.getFloat('conversion_rate'),
        avg_response_time: a.getFloat('avg_response_time'),
        satisfaction_score: a.getFloat('satisfaction_score'),
      })
    }

    var count = agents.length
    var overall = {
      total_conversations: totalConv,
      avg_conversion_rate: count > 0 ? totalConvRate / count : 0,
      avg_response_time: count > 0 ? totalRespTime / count : 0,
      avg_satisfaction: count > 0 ? totalSat / count : 0,
    }

    var teamMap = {}
    for (var j = 0; j < agentPerf.length; j++) {
      var tn = agentPerf[j].team || 'Sem equipe'
      if (!teamMap[tn])
        teamMap[tn] = { name: tn, conversations: 0, agents: 0, conversion_rate: 0, satisfaction: 0 }
      teamMap[tn].conversations += agentPerf[j].conversations
      teamMap[tn].agents += 1
      teamMap[tn].conversion_rate += agentPerf[j].conversion_rate
      teamMap[tn].satisfaction += agentPerf[j].satisfaction_score
    }
    var teamPerf = []
    for (var key in teamMap) {
      teamPerf.push({
        name: teamMap[key].name,
        conversations: teamMap[key].conversations,
        agents: teamMap[key].agents,
        avg_conversion_rate:
          teamMap[key].agents > 0 ? teamMap[key].conversion_rate / teamMap[key].agents : 0,
        avg_satisfaction:
          teamMap[key].agents > 0 ? teamMap[key].satisfaction / teamMap[key].agents : 0,
      })
    }

    var goals = $app.findRecordsByFilter('goals', '', '-created', 500, 0)
    var goalSummary = { total: goals.length, active: 0, completed: 0, overdue: 0 }
    for (var k = 0; k < goals.length; k++) {
      var st = goals[k].getString('status')
      if (st === 'active') goalSummary.active++
      else if (st === 'completed') goalSummary.completed++
      else if (st === 'overdue') goalSummary.overdue++
    }

    var sorted = agentPerf.slice().sort(function (a, b) {
      return b.conversion_rate - a.conversion_rate
    })
    var topPerformers = sorted.slice(0, 5)

    var summary = {
      overall: overall,
      team_performance: teamPerf,
      agent_performance: agentPerf,
      goal_status: goalSummary,
      top_performers: topPerformers,
    }

    var reportsCol = $app.findCollectionByNameOrId('reports')
    var report = new Record(reportsCol)
    report.set('title', 'Relatorio Semanal de Performance')
    report.set('period_start', weekAgo.toISOString())
    report.set('period_end', now.toISOString())
    report.set('report_type', 'weekly')
    report.set('summary_data', JSON.stringify(summary))
    $app.save(report)

    var users = $app.findRecordsByFilter('users', 'email != ""', '-created', 1000, 0)
    var notifCol = $app.findCollectionByNameOrId('notifications')
    for (var u = 0; u < users.length; u++) {
      var notif = new Record(notifCol)
      notif.set('title', 'Relatorio semanal disponivel')
      notif.set(
        'message',
        'O relatorio de performance da semana foi gerado e esta disponivel para visualizacao na pagina de Relatorios.',
      )
      notif.set('type', 'system')
      notif.set('read', false)
      notif.set('recipient', users[u].id)
      $app.save(notif)
    }
  } catch (err) {
    $app.logger().error('weekly report generation failed', 'error', String(err))
  }
})
