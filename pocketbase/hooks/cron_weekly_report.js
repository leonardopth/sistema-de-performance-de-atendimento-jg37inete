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
    var reportsCol = $app.findCollectionByNameOrId('reports')

    var agents = $app.findRecordsByFilter('agents', 'status = "active"', '-created', 500, 0)
    var conversations = $app.findRecordsByFilter('conversations', '', '-created', 2000, 0)
    var evaluations = $app.findRecordsByFilter('evaluations', '', '-created', 500, 0)
    var achievements = $app.findRecordsByFilter('achievements', '', '-awarded_at', 500, 0)
    var goals = $app.findRecordsByFilter('goals', '', '-created', 500, 0)

    var totalConv = 0,
      totalConvRate = 0,
      totalRespTime = 0,
      totalSat = 0,
      agentPerf = []
    var teamMap = {}
    for (var i = 0; i < agents.length; i++) {
      var a = agents[i]
      totalConv += a.getFloat('total_conversations')
      totalConvRate += a.getFloat('conversion_rate')
      totalRespTime += a.getFloat('avg_response_time')
      totalSat += a.getFloat('satisfaction_score')
      var teamName = 'Sem equipe'
      var teamId = a.getString('team_id')
      if (teamId) {
        try {
          teamName = $app.findRecordById('teams', teamId).getString('name')
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
      if (!teamMap[teamName])
        teamMap[teamName] = {
          name: teamName,
          conversations: 0,
          agents: 0,
          conversion_rate: 0,
          satisfaction: 0,
        }
      teamMap[teamName].conversations += a.getFloat('total_conversations')
      teamMap[teamName].agents += 1
      teamMap[teamName].conversion_rate += a.getFloat('conversion_rate')
      teamMap[teamName].satisfaction += a.getFloat('satisfaction_score')
    }
    var count = agents.length
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
    var globalSummary = {
      overall: {
        total_conversations: totalConv,
        avg_conversion_rate: count > 0 ? totalConvRate / count : 0,
        avg_response_time: count > 0 ? totalRespTime / count : 0,
        avg_satisfaction: count > 0 ? totalSat / count : 0,
      },
      team_performance: teamPerf,
      agent_performance: agentPerf,
      goal_status: goalSummary,
      top_performers: sorted.slice(0, 5),
    }

    var globalReport = new Record(reportsCol)
    globalReport.set('title', 'Relatorio Semanal de Performance')
    globalReport.set('period_start', weekAgo.toISOString())
    globalReport.set('period_end', now.toISOString())
    globalReport.set('report_type', 'weekly')
    globalReport.set('summary_data', JSON.stringify(globalSummary))
    $app.save(globalReport)

    for (var ai = 0; ai < agents.length; ai++) {
      var ag = agents[ai]
      var agId = ag.id
      var agTeamName = 'Sem equipe'
      var agTeamId = ag.getString('team_id')
      if (agTeamId) {
        try {
          agTeamName = $app.findRecordById('teams', agTeamId).getString('name')
        } catch (_) {}
      }

      var agConvs = []
      for (var ci = 0; ci < conversations.length; ci++) {
        if (conversations[ci].getString('agent_id') === agId) agConvs.push(conversations[ci])
      }
      var convSummary = {
        total: agConvs.length,
        converted: 0,
        not_converted: 0,
        pending: 0,
        by_channel: { whatsapp: 0, email: 0, chat: 0, phone: 0 },
      }
      for (var cj = 0; cj < agConvs.length; cj++) {
        var outcome = agConvs[cj].getString('outcome')
        var channel = agConvs[cj].getString('channel')
        if (outcome === 'converted') convSummary.converted++
        else if (outcome === 'not_converted') convSummary.not_converted++
        else if (outcome === 'pending') convSummary.pending++
        if (channel && convSummary.by_channel[channel] !== undefined)
          convSummary.by_channel[channel]++
      }

      var agEvals = []
      for (var ei = 0; ei < evaluations.length; ei++) {
        if (evaluations[ei].getString('agent_id') === agId)
          agEvals.push({
            evaluator: evaluations[ei].getString('evaluator'),
            score: evaluations[ei].getInt('score'),
            feedback: evaluations[ei].getString('feedback'),
            category: evaluations[ei].getString('category'),
            created: evaluations[ei].getString('created'),
          })
      }
      var agAchs = []
      for (var ahi = 0; ahi < achievements.length; ahi++) {
        if (achievements[ahi].getString('agent_id') === agId)
          agAchs.push({
            title: achievements[ahi].getString('title'),
            description: achievements[ahi].getString('description'),
            icon: achievements[ahi].getString('icon'),
            category: achievements[ahi].getString('category'),
            awarded_at: achievements[ahi].getString('awarded_at'),
          })
      }
      var agGoals = []
      for (var gi = 0; gi < goals.length; gi++) {
        if (goals[gi].getString('agent_id') === agId) {
          var gTarget = goals[gi].getFloat('target')
          var gCurrent = goals[gi].getFloat('current')
          agGoals.push({
            title: goals[gi].getString('title'),
            type: goals[gi].getString('type'),
            target: gTarget,
            current: gCurrent,
            status: goals[gi].getString('status'),
            progress: gTarget > 0 ? Math.round((gCurrent / gTarget) * 100) : 0,
          })
        }
      }

      var agentSummary = {
        agent_kpis: {
          name: ag.getString('name'),
          team: agTeamName,
          total_conversations: ag.getFloat('total_conversations'),
          conversion_rate: ag.getFloat('conversion_rate'),
          avg_response_time: ag.getFloat('avg_response_time'),
          satisfaction_score: ag.getFloat('satisfaction_score'),
        },
        conversation_summary: convSummary,
        recent_evaluations: agEvals.slice(0, 5),
        achievements: agAchs,
        goal_progress: agGoals,
      }
      var agentReport = new Record(reportsCol)
      agentReport.set('title', 'Relatorio Semanal - ' + ag.getString('name'))
      agentReport.set('period_start', weekAgo.toISOString())
      agentReport.set('period_end', now.toISOString())
      agentReport.set('report_type', 'weekly')
      agentReport.set('agent', agId)
      agentReport.set('summary_data', JSON.stringify(agentSummary))
      $app.save(agentReport)
    }

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
