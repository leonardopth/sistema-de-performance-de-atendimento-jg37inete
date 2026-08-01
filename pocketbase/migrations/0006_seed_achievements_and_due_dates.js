migrate(
  (app) => {
    const now = new Date().toISOString()

    const activeGoals = app.findRecordsByFilter('goals', 'status = "active"', '-created', 500, 0)
    for (const goal of activeGoals) {
      if (!goal.getString('due_date')) {
        goal.set('due_date', '2026-09-30 23:59:59.000Z')
        app.save(goal)
      }
    }

    const agents = app.findRecordsByFilter('agents', 'email != ""', '-created', 500, 0)
    const achievementsCol = app.findCollectionByNameOrId('achievements')

    var checks = [
      {
        title: 'Mestre da Conversão',
        description: 'Taxa de conversao acima de 70%',
        icon: '🏆',
        category: 'conversion',
        field: 'conversion_rate',
        op: '>=',
        val: 70,
      },
      {
        title: 'Velocista',
        description: 'Tempo de resposta medio abaixo de 2 segundos',
        icon: '⚡',
        category: 'productivity',
        field: 'avg_response_time',
        op: '<=',
        val: 2,
      },
      {
        title: 'Produtivo',
        description: 'Mais de 200 conversas atendidas',
        icon: '📈',
        category: 'productivity',
        field: 'total_conversations',
        op: '>=',
        val: 200,
      },
      {
        title: 'Coração de Ouro',
        description: 'Satisfacao do cliente acima de 4.8',
        icon: '😊',
        category: 'satisfaction',
        field: 'satisfaction_score',
        op: '>=',
        val: 4.8,
      },
    ]

    for (var ai = 0; ai < agents.length; ai++) {
      var agent = agents[ai]
      for (var ci = 0; ci < checks.length; ci++) {
        var def = checks[ci]
        var val = agent.get(def.field)
        var pass = false
        if (def.op === '>=') pass = val >= def.val
        if (def.op === '<=') pass = val <= def.val
        if (!pass) continue

        var exists = false
        try {
          app.findFirstRecordByFilter(
            'achievements',
            'agent_id = "' + agent.id + '" && title = "' + def.title + '"',
          )
          exists = true
        } catch (_) {}

        if (!exists) {
          var r = new Record(achievementsCol)
          r.set('agent_id', agent.id)
          r.set('title', def.title)
          r.set('description', def.description)
          r.set('icon', def.icon)
          r.set('category', def.category)
          r.set('awarded_at', now)
          app.save(r)
        }
      }
    }
  },
  (app) => {},
)
