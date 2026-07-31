migrate(
  (app) => {
    const teamsCol = app.findCollectionByNameOrId('teams')
    const agentsCol = app.findCollectionByNameOrId('agents')
    const convCol = app.findCollectionByNameOrId('conversations')
    const goalsCol = app.findCollectionByNameOrId('goals')
    const evalCol = app.findCollectionByNameOrId('evaluations')

    const teamDefs = [
      { name: 'Vendas Online', description: 'Equipe de vendas online e WhatsApp' },
      { name: 'Suporte Premium', description: 'Atendimento premium e VIP' },
      { name: 'Corporativo', description: 'Atendimento corporativo B2B' },
    ]
    const teamIds = {}
    for (const t of teamDefs) {
      try {
        teamIds[t.name] = app.findFirstRecordByData('teams', 'name', t.name).id
      } catch (_) {
        const r = new Record(teamsCol)
        r.set('name', t.name)
        r.set('description', t.description)
        app.save(r)
        teamIds[t.name] = r.id
      }
    }

    const agentDefs = [
      {
        name: 'Ana Silva',
        email: 'ana.silva@empresa.com',
        team: 'Vendas Online',
        role: 'lead',
        tc: 245,
        cr: 32.5,
        art: 45,
        ss: 4.7,
      },
      {
        name: 'Bruno Costa',
        email: 'bruno.costa@empresa.com',
        team: 'Vendas Online',
        role: 'senior',
        tc: 198,
        cr: 28.3,
        art: 52,
        ss: 4.5,
      },
      {
        name: 'Carla Mendes',
        email: 'carla.mendes@empresa.com',
        team: 'Vendas Online',
        role: 'agent',
        tc: 156,
        cr: 22.1,
        art: 68,
        ss: 4.2,
      },
      {
        name: 'Diego Santos',
        email: 'diego.santos@empresa.com',
        team: 'Suporte Premium',
        role: 'senior',
        tc: 187,
        cr: 35.2,
        art: 38,
        ss: 4.8,
      },
      {
        name: 'Elena Rocha',
        email: 'elena.rocha@empresa.com',
        team: 'Suporte Premium',
        role: 'lead',
        tc: 220,
        cr: 30.8,
        art: 42,
        ss: 4.6,
      },
      {
        name: 'Felipe Alves',
        email: 'felipe.alves@empresa.com',
        team: 'Suporte Premium',
        role: 'agent',
        tc: 134,
        cr: 18.5,
        art: 75,
        ss: 4.0,
      },
      {
        name: 'Gabriel Lima',
        email: 'gabriel.lima@empresa.com',
        team: 'Corporativo',
        role: 'lead',
        tc: 167,
        cr: 41.2,
        art: 35,
        ss: 4.9,
      },
      {
        name: 'Helena Dias',
        email: 'helena.dias@empresa.com',
        team: 'Corporativo',
        role: 'agent',
        tc: 143,
        cr: 26.7,
        art: 58,
        ss: 4.3,
      },
    ]
    const agentIds = {}
    for (const a of agentDefs) {
      try {
        agentIds[a.name] = app.findFirstRecordByData('agents', 'email', a.email).id
      } catch (_) {
        const r = new Record(agentsCol)
        r.set('name', a.name)
        r.set('email', a.email)
        r.set('team_id', teamIds[a.team])
        r.set('status', 'active')
        r.set('role', a.role)
        r.set('total_conversations', a.tc)
        r.set('conversion_rate', a.cr)
        r.set('avg_response_time', a.art)
        r.set('satisfaction_score', a.ss)
        app.save(r)
        agentIds[a.name] = r.id
      }
    }

    const channels = ['whatsapp', 'email', 'chat', 'phone']
    const statuses = ['open', 'closed', 'lost']
    const outcomes = ['converted', 'not_converted', 'pending']
    const customers = [
      'Maria Oliveira',
      'João Pereira',
      'Sandra Souza',
      'Pedro Henrique',
      'Juliana Ramos',
      'Rafael Gomes',
      'Patricia Nunes',
      'Lucas Ferreira',
      'Beatriz Almeida',
      'Thiago Barbosa',
    ]
    for (let i = 0; i < 20; i++) {
      const aName = agentDefs[i % agentDefs.length].name
      const ch = channels[i % channels.length]
      const st = statuses[i % statuses.length]
      const oc = outcomes[i % outcomes.length]
      const cust = customers[i % customers.length]
      const dateStr = '2026-0' + ((i % 7) + 1) + '-' + ((i % 28) + 1) + 'T10:00:00.000Z'
      try {
        app.findFirstRecordByData('conversations', 'customer_name', cust + i)
      } catch (_) {
        const r = new Record(convCol)
        r.set('agent_id', agentIds[aName])
        r.set('customer_name', cust + ' ' + (i + 1))
        r.set('status', st)
        r.set('channel', ch)
        r.set('started_at', dateStr)
        r.set('duration', Math.floor(Math.random() * 600) + 60)
        r.set('outcome', oc)
        r.set('satisfaction', Math.round((Math.random() * 2 + 3) * 10) / 10)
        app.save(r)
      }
    }

    const goalDefs = [
      {
        title: 'Taxa de Conversão Q3',
        team: 'Vendas Online',
        type: 'conversion',
        target: 35,
        current: 27.6,
        period: 'Q3 2026',
        status: 'active',
      },
      {
        title: 'Satisfação do Cliente',
        team: 'Suporte Premium',
        type: 'satisfaction',
        target: 4.8,
        current: 4.47,
        period: 'Q3 2026',
        status: 'active',
      },
      {
        title: 'Tempo de Resposta',
        team: 'Corporativo',
        type: 'response_time',
        target: 40,
        current: 46.5,
        period: 'Q3 2026',
        status: 'active',
      },
      {
        title: 'Conversões Mensais',
        team: 'Vendas Online',
        type: 'conversion',
        target: 200,
        current: 168,
        period: 'Julho 2026',
        status: 'active',
      },
      {
        title: 'NPS Equipe Premium',
        team: 'Suporte Premium',
        type: 'satisfaction',
        target: 90,
        current: 85,
        period: 'Q3 2026',
        status: 'active',
      },
      {
        title: 'Tempo Médio Atendimento',
        team: 'Corporativo',
        type: 'response_time',
        target: 300,
        current: 310,
        period: 'Julho 2026',
        status: 'overdue',
      },
    ]
    for (const g of goalDefs) {
      try {
        app.findFirstRecordByData('goals', 'title', g.title)
      } catch (_) {
        const r = new Record(goalsCol)
        r.set('title', g.title)
        r.set('team_id', teamIds[g.team])
        r.set('type', g.type)
        r.set('target', g.target)
        r.set('current', g.current)
        r.set('period', g.period)
        r.set('status', g.status)
        app.save(r)
      }
    }

    const evalDefs = [
      {
        agent: 'Ana Silva',
        evaluator: 'Carlos Mendes',
        score: 92,
        feedback: 'Excelente desempenho em conversões e relacionamento com clientes.',
        category: 'quality',
      },
      {
        agent: 'Bruno Costa',
        evaluator: 'Carlos Mendes',
        score: 85,
        feedback: 'Bom desempenho, pode melhorar o tempo de resposta.',
        category: 'efficiency',
      },
      {
        agent: 'Carla Mendes',
        evaluator: 'Carlos Mendes',
        score: 78,
        feedback: 'Precisa melhorar a taxa de conversão.',
        category: 'communication',
      },
      {
        agent: 'Diego Santos',
        evaluator: 'Marina Costa',
        score: 95,
        feedback: 'Desempenho excepcional, referência da equipe.',
        category: 'quality',
      },
      {
        agent: 'Elena Rocha',
        evaluator: 'Marina Costa',
        score: 88,
        feedback: 'Ótima comunicação e resultados consistentes.',
        category: 'communication',
      },
      {
        agent: 'Felipe Alves',
        evaluator: 'Marina Costa',
        score: 72,
        feedback: 'Necessita treinamento em técnicas de fechamento.',
        category: 'efficiency',
      },
      {
        agent: 'Gabriel Lima',
        evaluator: 'Roberto Alves',
        score: 96,
        feedback: 'Melhor conversão da empresa, parabéns!',
        category: 'quality',
      },
      {
        agent: 'Helena Dias',
        evaluator: 'Roberto Alves',
        score: 81,
        feedback: 'Boa evolução, focar em reduzir tempo de resposta.',
        category: 'efficiency',
      },
    ]
    for (const ev of evalDefs) {
      try {
        app.findFirstRecordByData('evaluations', 'feedback', ev.feedback)
      } catch (_) {
        const r = new Record(evalCol)
        r.set('agent_id', agentIds[ev.agent])
        r.set('evaluator', ev.evaluator)
        r.set('score', ev.score)
        r.set('feedback', ev.feedback)
        r.set('category', ev.category)
        app.save(r)
      }
    }
  },
  (app) => {
    try {
      app.truncateCollection(app.findCollectionByNameOrId('evaluations'))
    } catch (_) {}
    try {
      app.truncateCollection(app.findCollectionByNameOrId('goals'))
    } catch (_) {}
    try {
      app.truncateCollection(app.findCollectionByNameOrId('conversations'))
    } catch (_) {}
    try {
      app.truncateCollection(app.findCollectionByNameOrId('agents'))
    } catch (_) {}
    try {
      app.truncateCollection(app.findCollectionByNameOrId('teams'))
    } catch (_) {}
  },
)
