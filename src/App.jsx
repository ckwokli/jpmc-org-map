import React, { useState, useRef, useEffect } from 'react';

const CONFIG = {
  executives: [
    { id: "dimon", name: "Jamie Dimon", title: "Chairman & CEO", influence: 10 },
    { id: "piepszak", name: "Jennifer Piepszak", title: "COO", influence: 9 },
    { id: "barnum", name: "Jeremy Barnum", title: "CFO", influence: 7 },
    { id: "friedman", name: "Stacey Friedman", title: "General Counsel", influence: 7 },
    { id: "bacon", name: "Ashley Bacon", title: "CRO", influence: 7 },
    { id: "leopold", name: "Robin Leopold", title: "Head of HR", influence: 5 },
  ],
  sharedFunctions: [
    {
      id: "tech", name: "Technology", color: "#3b82f6",
      head: { id: "beer", name: "Lori Beer", title: "Global CIO", opComm: true },
      members: [
        { id: "feinsmith", name: "Larry Feinsmith", title: "Tech Strategy & Innovation" },
        { id: "opet", name: "Patrick Opet", title: "CISO" },
        { id: "kane", name: "Joe Kane", title: "Tech Partnerships", contact: true },
      ]
    },
    {
      id: "ai", name: "CDAO / AI & Data", color: "#8b5cf6",
      head: { id: "heitsenrether", name: "Teresa Heitsenrether", title: "CDAO", opComm: true, key: true },
      members: [
        { id: "waldron", name: "Derek Waldron", title: "Chief Analytics Officer", key: true },
        { id: "veloso", name: "Manuela Veloso", title: "Head of AI Research" },
        { id: "lyons", name: "Terah Lyons", title: "AI & Data Policy" },
        { id: "chittar", name: "Naren Chittar", title: "LLM Suite Lead", contact: true },
        { id: "maher", name: "Brian Maher", title: "AI/ML Platforms" },
      ]
    }
  ],
  businessUnits: [
    {
      id: "cib", name: "CIB", fullName: "Commercial & Investment Bank",
      note: "Merged with CB Q2 2024", revenue: "$70B", color: "#f97316",
      heads: [
        { id: "petno", name: "Doug Petno", title: "Co-CEO CIB", opComm: true },
        { id: "rohrbaugh", name: "Troy Rohrbaugh", title: "Co-CEO CIB", opComm: true },
      ],
      aiProducts: "Trading algos, tear sheets, deck generation",
      teams: [
        { name: "Global Banking", members: [
          { id: "simmons", name: "John Simmons", title: "Head of CB (sub-LOB)" },
          { id: "gori", name: "Filippo Gori", title: "Co-Head Global Banking" },
        ]},
        { name: "CIB AI Team", members: [
          { id: "bloch", name: "Joel Bloch", title: "Head of CIB AI", key: true, contact: true },
          { id: "sanwal", name: "Riddhi Sanwal", title: "CIB AI Team", contact: true },
          { id: "steed", name: "Patrick Steed", title: "Fintech Partnerships", contact: true },
        ]},
        { name: "Markets & Payments", members: [
          { id: "payments", name: "Payments", title: "Max Neukirchen / Umar Farooq" },
        ]},
      ]
    },
    {
      id: "awm", name: "AWM", fullName: "Asset & Wealth Management",
      revenue: "~$20B", color: "#14b8a6",
      heads: [{ id: "erdoes", name: "Mary Erdoes", title: "CEO AWM", opComm: true }],
      aiProducts: "IndexGPT, Coach AI, Ask David",
      teams: [{ name: "AWM Tech", members: [
        { id: "coulby", name: "William Coulby", title: "AWM Tech Lead", contact: true }
      ]}]
    },
    {
      id: "ccb", name: "CCB", fullName: "Consumer & Community Banking",
      revenue: "~$70B", color: "#ec4899",
      heads: [{ id: "lake", name: "Marianne Lake", title: "CEO CCB", opComm: true }],
      aiProducts: "Virtual assistants, fraud detection",
      teams: []
    },
  ],
  decisions: [
    { id: "poc", label: "POC Success", assignments: { bloch: "A", sanwal: "R", chittar: "C", kane: "C" }},
    { id: "msa", label: "MSA Approval", assignments: { steed: "R", bloch: "C" }},
    { id: "llmSuite", label: "LLM Suite Integration", assignments: { waldron: "A", chittar: "R", bloch: "C", kane: "C" }},
    { id: "budget", label: "Budget Authority", assignments: { bloch: "R", steed: "C" }},
    { id: "vendor", label: "Vendor Evaluation", assignments: { waldron: "A", kane: "R", chittar: "C", bloch: "C" }},
  ],
  networkLinks: [
    { from: "waldron", to: "kane", label: "AI agenda" },
    { from: "bloch", to: "waldron", label: "AI strategy" },
    { from: "chittar", to: "bloch", label: "LLM Suite" },
    { from: "friedman", to: "steed", label: "MSA/legal" },
    { from: "heitsenrether", to: "beer", label: "AI/Tech coord" },
    { from: "kane", to: "bloch", label: "vendor eval" },
    { from: "waldron", to: "petno", label: "CIB AI priorities" },
  ]
};

const raciColors = { R: "#22c55e", A: "#ef4444", C: "#3b82f6", I: "#6b7280" };

const getAllPeople = () => {
  const p = {};
  CONFIG.executives.forEach(e => p[e.id] = { ...e, cluster: "exec" });
  CONFIG.sharedFunctions.forEach(sf => {
    p[sf.head.id] = { ...sf.head, cluster: sf.id };
    sf.members.forEach(m => p[m.id] = { ...m, cluster: sf.id });
  });
  CONFIG.businessUnits.forEach(bu => {
    bu.heads.forEach(h => p[h.id] = { ...h, cluster: bu.id });
    bu.teams.forEach(t => t.members.forEach(m => p[m.id] = { ...m, cluster: bu.id }));
  });
  return p;
};

const PersonBadge = ({ person, size = "sm", nodeId }) => (
  <div data-node={nodeId} className={`${size === "lg" ? "px-3 py-2" : "px-2 py-1"} rounded-lg bg-gray-800 border border-gray-700 inline-flex items-center gap-2`}>
    {person.key && <span className="text-yellow-400 text-xs">★</span>}
    {person.contact && <span className="text-green-400 text-xs">●</span>}
    <div>
      <div className="text-white text-sm font-medium">{person.name}</div>
      <div className="text-gray-400 text-xs">{person.title}</div>
    </div>
  </div>
);

const NetworkLines = ({ show, containerRef }) => {
  const [lines, setLines] = useState([]);
  
  useEffect(() => {
    if (!show || !containerRef.current) return;
    const updateLines = () => {
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const newLines = [];
      CONFIG.networkLinks.forEach(link => {
        const fromEl = container.querySelector(`[data-node="${link.from}"]`);
        const toEl = container.querySelector(`[data-node="${link.to}"]`);
        if (fromEl && toEl) {
          const fromRect = fromEl.getBoundingClientRect();
          const toRect = toEl.getBoundingClientRect();
          newLines.push({
            x1: fromRect.left + fromRect.width/2 - containerRect.left,
            y1: fromRect.top + fromRect.height/2 - containerRect.top,
            x2: toRect.left + toRect.width/2 - containerRect.left,
            y2: toRect.top + toRect.height/2 - containerRect.top,
            label: link.label
          });
        }
      });
      setLines(newLines);
    };
    updateLines();
    window.addEventListener('resize', updateLines);
    const timer = setTimeout(updateLines, 100);
    return () => { window.removeEventListener('resize', updateLines); clearTimeout(timer); };
  }, [show, containerRef]);

  if (!show || lines.length === 0) return null;
  
  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#a78bfa" />
        </marker>
      </defs>
      {lines.map((line, i) => (
        <g key={i}>
          <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} 
                stroke="#8b5cf6" strokeWidth="2" strokeDasharray="6 3" 
                opacity="0.8" markerEnd="url(#arrowhead)" />
          <rect x={(line.x1+line.x2)/2 - 30} y={(line.y1+line.y2)/2 - 10} 
                width="60" height="16" fill="#1f2937" rx="3" opacity="0.9" />
          <text x={(line.x1+line.x2)/2} y={(line.y1+line.y2)/2 + 3} 
                fill="#c4b5fd" fontSize="10" textAnchor="middle" fontWeight="500">
            {line.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

const OrgView = ({ showNetwork }) => {
  const [expanded, setExpanded] = useState({ cib: true, awm: true });
  const containerRef = useRef(null);

  return (
    <div className="relative" ref={containerRef}>
      <NetworkLines show={showNetwork} containerRef={containerRef} />
      
      <div className="bg-gray-900 rounded-xl p-4 mb-4">
        <div className="text-xs text-gray-500 mb-2">Operating Committee</div>
        <div className="flex flex-wrap gap-2 justify-center">
          {CONFIG.executives.map(exec => (
            <div key={exec.id} data-node={exec.id} className="px-3 py-2 bg-gray-800 rounded-lg border border-yellow-500/30">
              <div className="text-white font-medium text-sm">{exec.name}</div>
              <div className="text-yellow-400 text-xs">{exec.title}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-blue-900/30 rounded-xl p-4 mb-4 border border-purple-500/20">
        <div className="text-xs text-gray-400 mb-3 text-center">← Horizontal Shared Functions (serve all BUs) →</div>
        <div className="grid grid-cols-2 gap-4">
          {CONFIG.sharedFunctions.map(sf => (
            <div key={sf.id} className="bg-gray-900/80 rounded-lg p-3" style={{ borderLeft: `3px solid ${sf.color}` }}>
              <div className="text-white font-bold mb-2">{sf.name}</div>
              <div className="mb-2">
                <PersonBadge person={sf.head} size="lg" nodeId={sf.head.id} />
              </div>
              <div className="flex flex-wrap gap-1">
                {sf.members.map(m => (
                  <PersonBadge key={m.id} person={m} nodeId={m.id} />
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 relative">
          <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-50"></div>
          <div className="relative flex justify-around">
            {CONFIG.businessUnits.map(bu => (
              <div key={bu.id} className="flex flex-col items-center">
                <div className="w-0.5 h-6 bg-gradient-to-b from-purple-500 to-transparent"></div>
                <div className="text-xs px-2 py-1 rounded-full font-medium" 
                     style={{ backgroundColor: `${bu.color}30`, color: bu.color, border: `1px solid ${bu.color}` }}>
                  {bu.name}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-blue-500 inline-block"></span> Tech</span>
            <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-purple-500 inline-block"></span> AI/Data</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {CONFIG.businessUnits.map(bu => (
          <div key={bu.id} className="bg-gray-900 rounded-xl p-3 border-t-2" style={{ borderColor: bu.color }}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-bold text-white">{bu.name}</span>
                <span className="text-gray-500 text-xs ml-2">{bu.revenue}</span>
              </div>
              {bu.teams.length > 0 && (
                <button onClick={() => setExpanded(prev => ({ ...prev, [bu.id]: !prev[bu.id] }))} 
                        className="text-gray-400 hover:text-white text-xs">
                  {expanded[bu.id] ? "▼" : "▶"}
                </button>
              )}
            </div>
            <div className="text-gray-400 text-xs mb-2">{bu.fullName}</div>
            {bu.note && <div className="text-yellow-500 text-xs mb-2">⚠ {bu.note}</div>}
            <div className="space-y-1 mb-2">
              {bu.heads.map(h => (
                <PersonBadge key={h.id} person={h} nodeId={h.id} />
              ))}
            </div>
            <div className="text-xs text-gray-500 mb-2">AI: {bu.aiProducts}</div>
            {expanded[bu.id] && bu.teams.map(team => (
              <div key={team.name} className="mt-2 pl-2 border-l border-gray-700">
                <div className="text-xs text-gray-400 mb-1">{team.name}</div>
                <div className="space-y-1">
                  {team.members.map(m => (
                    <PersonBadge key={m.id} person={m} nodeId={m.id} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const edges = [
  { from: "dimon", to: "piepszak", type: "solid" },
  { from: "dimon", to: "barnum", type: "solid" },
  { from: "dimon", to: "friedman", type: "solid" },
  { from: "dimon", to: "beer", type: "solid" },
  { from: "dimon", to: "heitsenrether", type: "solid" },
  { from: "dimon", to: "petno", type: "solid" },
  { from: "dimon", to: "erdoes", type: "solid" },
  { from: "dimon", to: "lake", type: "solid" },
  { from: "beer", to: "feinsmith", type: "solid" },
  { from: "beer", to: "opet", type: "solid" },
  { from: "feinsmith", to: "kane", type: "solid" },
  { from: "heitsenrether", to: "waldron", type: "solid" },
  { from: "heitsenrether", to: "veloso", type: "solid" },
  { from: "heitsenrether", to: "lyons", type: "solid" },
  { from: "waldron", to: "chittar", type: "solid" },
  { from: "petno", to: "rohrbaugh", type: "solid", label: "Co-CEO" },
  { from: "petno", to: "simmons", type: "solid" },
  { from: "petno", to: "bloch", type: "solid" },
  { from: "rohrbaugh", to: "steed", type: "solid" },
  { from: "bloch", to: "sanwal", type: "solid" },
  { from: "rohrbaugh", to: "zislin", type: "solid" },
  { from: "erdoes", to: "coulby", type: "solid" },
  { from: "waldron", to: "bloch", type: "dotted", label: "AI agenda" },
  { from: "kane", to: "waldron", type: "dotted", label: "vendor input" },
  { from: "kane", to: "bloch", type: "dotted", label: "partnership" },
  { from: "chittar", to: "bloch", type: "dotted", label: "LLM collab" },
  { from: "veloso", to: "waldron", type: "dotted", label: "research" },
];

const NetworkGraph = () => {
  const [selected, setSelected] = useState(null);
  const [showInfluence, setShowInfluence] = useState(true);
  const [filter, setFilter] = useState("all");
  const [peopleData, setPeopleData] = useState({
    dimon: { name: "Jamie Dimon", short: "Dimon", title: "Chairman & CEO", cluster: "exec", influence: 10, x: 450, y: 50 },
    piepszak: { name: "Jennifer Piepszak", short: "Piepszak", title: "COO", cluster: "exec", influence: 8, x: 320, y: 120 },
    barnum: { name: "Jeremy Barnum", short: "Barnum", title: "CFO", cluster: "exec", influence: 7, x: 450, y: 120 },
    friedman: { name: "Stacey Friedman", short: "Friedman", title: "General Counsel", cluster: "exec", influence: 6, x: 580, y: 120 },
    beer: { name: "Lori Beer", short: "Beer", title: "Global CIO", cluster: "tech", influence: 8, x: 100, y: 200 },
    feinsmith: { name: "Larry Feinsmith", short: "Feinsmith", title: "Tech Strategy", cluster: "tech", influence: 6, x: 60, y: 290 },
    opet: { name: "Patrick Opet", short: "Opet", title: "CISO", cluster: "tech", influence: 5, x: 140, y: 290 },
    kane: { name: "Joe Kane", short: "Kane", title: "Tech Partnerships", cluster: "tech", influence: 5, x: 100, y: 370, contact: true },
    heitsenrether: { name: "Teresa Heitsenrether", short: "Heitsenrether", title: "CDAO", cluster: "ai", influence: 8, x: 280, y: 220, key: true },
    waldron: { name: "Derek Waldron", short: "Waldron", title: "Chief Analytics Officer", cluster: "ai", influence: 7, x: 220, y: 310, key: true },
    veloso: { name: "Manuela Veloso", short: "Veloso", title: "Head of AI Research", cluster: "ai", influence: 6, x: 340, y: 290 },
    lyons: { name: "Terah Lyons", short: "Lyons", title: "AI Policy", cluster: "ai", influence: 5, x: 340, y: 360 },
    chittar: { name: "Naren Chittar", short: "Chittar", title: "LLM Suite Lead", cluster: "ai", influence: 6, x: 220, y: 390, contact: true },
    petno: { name: "Doug Petno", short: "Petno", title: "Co-CEO CIB", cluster: "cib", influence: 9, x: 520, y: 220 },
    rohrbaugh: { name: "Troy Rohrbaugh", short: "Rohrbaugh", title: "Co-CEO CIB", cluster: "cib", influence: 9, x: 620, y: 220 },
    simmons: { name: "John Simmons", short: "Simmons", title: "Head of CB (sub-LOB)", cluster: "cib", influence: 6, x: 480, y: 310 },
    bloch: { name: "Joel Bloch", short: "Bloch", title: "Head CIB AI", cluster: "cib", influence: 7, x: 570, y: 310, contact: true, key: true },
    steed: { name: "Patrick Steed", short: "Steed", title: "Fintech Partnerships", cluster: "cib", influence: 5, x: 660, y: 310, contact: true },
    sanwal: { name: "Riddhi Sanwal", short: "Sanwal", title: "CIB AI Team", cluster: "cib", influence: 4, x: 520, y: 390, contact: true },
    zislin: { name: "Elena Zislin", short: "Zislin", title: "Ventures", cluster: "cib", influence: 5, x: 660, y: 390, contact: true },
    erdoes: { name: "Mary Erdoes", short: "Erdoes", title: "CEO AWM", cluster: "awm", influence: 8, x: 760, y: 200 },
    coulby: { name: "William Coulby", short: "Coulby", title: "AWM Tech", cluster: "awm", influence: 4, x: 760, y: 300, contact: true },
    lake: { name: "Marianne Lake", short: "Lake", title: "CEO CCB", cluster: "ccb", influence: 8, x: 850, y: 140 },
  });

  const updatePerson = (id, field, value) => {
    setPeopleData(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const clusterColors = {
    exec: { fill: "#1e293b", stroke: "#475569" },
    tech: { fill: "#1e3a5f", stroke: "#3b82f6" },
    ai: { fill: "#4c1d95", stroke: "#8b5cf6" },
    cib: { fill: "#065f46", stroke: "#10b981" },
    awm: { fill: "#134e4a", stroke: "#14b8a6" },
    ccb: { fill: "#701a75", stroke: "#ec4899" },
  };

  const getConnected = (id) => {
    if (!id) return new Set(Object.keys(peopleData));
    const connected = new Set([id]);
    edges.forEach(e => {
      if (e.from === id) connected.add(e.to);
      if (e.to === id) connected.add(e.from);
    });
    return connected;
  };

  const connectedSet = getConnected(selected);
  const filteredPeople = Object.entries(peopleData).filter(([id, p]) => {
    if (filter === "all") return true;
    if (filter === "contacts") return p.contact;
    if (filter === "key") return p.key;
    return p.cluster === filter;
  });
  const visibleIds = new Set(filteredPeople.map(([id]) => id));

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-2 items-center text-sm">
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-xs">
            <option value="all">All</option>
            <option value="contacts">Contacts Only</option>
            <option value="key">Key Decision Makers</option>
            <option value="tech">Technology</option>
            <option value="ai">AI/CDAO</option>
            <option value="cib">CIB</option>
            <option value="awm">AWM</option>
            <option value="ccb">CCB</option>
          </select>
          <label className="flex items-center gap-1 cursor-pointer text-xs text-gray-400">
            <input type="checkbox" checked={showInfluence} onChange={e => setShowInfluence(e.target.checked)} className="rounded" />
            Influence Lines
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-3 text-xs">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-slate-700 border-2 border-slate-500"></div> Exec</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-900 border-2 border-blue-500"></div> Tech</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-purple-900 border-2 border-purple-500"></div> AI/CDAO</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-900 border-2 border-emerald-500"></div> CIB</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-teal-900 border-2 border-teal-500"></div> AWM</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-fuchsia-900 border-2 border-fuchsia-500"></div> CCB</div>
        <div className="flex items-center gap-1 ml-2"><div className="w-4 h-4 rounded-full border-2 border-yellow-400 border-dashed"></div> Key</div>
        <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-full border-2 border-cyan-400"></div> Contact</div>
      </div>

      <svg viewBox="0 0 920 450" className="w-full bg-gray-900 rounded-lg">
        {edges.map((edge, i) => {
          const from = peopleData[edge.from];
          const to = peopleData[edge.to];
          if (!from || !to) return null;
          if (!visibleIds.has(edge.from) && !visibleIds.has(edge.to)) return null;
          if (edge.type === "dotted" && !showInfluence) return null;
          const isHighlighted = selected && (edge.from === selected || edge.to === selected);
          const opacity = !selected ? 1 : isHighlighted ? 1 : 0.15;
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const offset = edge.type === "dotted" ? 20 : 0;
          const ctrlX = midX - dy * 0.1 + offset;
          const ctrlY = midY + dx * 0.1;
          return (
            <g key={i} opacity={opacity}>
              <path d={`M ${from.x} ${from.y} Q ${ctrlX} ${ctrlY} ${to.x} ${to.y}`}
                fill="none" stroke={isHighlighted ? "#fff" : "#666"} strokeWidth={isHighlighted ? 2 : 1.5}
                strokeDasharray={edge.type === "dotted" ? "6,4" : "none"} />
              {edge.label && opacity > 0.5 && (
                <text x={ctrlX} y={ctrlY - 5} fontSize="9" fill="#888" textAnchor="middle">{edge.label}</text>
              )}
            </g>
          );
        })}
        {filteredPeople.map(([id, person]) => {
          const colors = clusterColors[person.cluster];
          const isActive = connectedSet.has(id);
          const isSelected = selected === id;
          const size = 10 + person.influence * 1.5;
          return (
            <g key={id} opacity={isActive || !selected ? 1 : 0.2} className="cursor-pointer"
               onClick={() => setSelected(selected === id ? null : id)}>
              {person.contact && <circle cx={person.x} cy={person.y} r={size + 4} fill="none" stroke="#22d3ee" strokeWidth="2" />}
              {person.key && <circle cx={person.x} cy={person.y} r={size + 7} fill="none" stroke="#fcd34d" strokeWidth="2" strokeDasharray="4 2" />}
              {isSelected && <circle cx={person.x} cy={person.y} r={size + 10} fill="none" stroke="#fff" strokeWidth="2" />}
              <circle cx={person.x} cy={person.y} r={size} fill={colors.fill} stroke={colors.stroke} strokeWidth="2" />
              <text x={person.x} y={person.y + size + 12} fontSize="9" fill={isActive || !selected ? "#fff" : "#666"}
                textAnchor="middle" fontWeight={person.key ? "bold" : "normal"}>{person.short}</text>
            </g>
          );
        })}
      </svg>

      {selected && peopleData[selected] && (
        <div className="mt-3 p-3 bg-gray-800 rounded-lg">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <input type="text" value={peopleData[selected].name} onChange={e => updatePerson(selected, 'name', e.target.value)}
                className="font-bold bg-transparent border-b border-transparent hover:border-gray-600 focus:border-purple-500 focus:outline-none w-full text-white" />
              <input type="text" value={peopleData[selected].title} onChange={e => updatePerson(selected, 'title', e.target.value)}
                className="text-gray-400 text-sm bg-transparent border-b border-transparent hover:border-gray-600 focus:border-purple-500 focus:outline-none w-full mt-1" />
              <div className="flex gap-2 mt-2 text-xs">
                <button onClick={() => updatePerson(selected, 'contact', !peopleData[selected].contact)}
                  className={`px-2 py-1 rounded ${peopleData[selected].contact ? 'bg-cyan-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                  {peopleData[selected].contact ? '● Contact' : '○ Contact'}
                </button>
                <button onClick={() => updatePerson(selected, 'key', !peopleData[selected].key)}
                  className={`px-2 py-1 rounded ${peopleData[selected].key ? 'bg-amber-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                  {peopleData[selected].key ? '★ Key' : '☆ Key'}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                <span>Influence:</span>
                <input type="range" min="1" max="10" value={peopleData[selected].influence} 
                  onChange={e => updatePerson(selected, 'influence', parseInt(e.target.value))} className="w-24" />
                <span className="text-white">{peopleData[selected].influence}</span>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white ml-2">✕</button>
          </div>
        </div>
      )}
      <div className="mt-2 text-xs text-gray-500 text-center">Click a node to edit • Toggle influence lines to show cross-functional relationships</div>
    </div>
  );
};

const DecisionMatrix = () => {
  const [decisions, setDecisions] = useState(CONFIG.decisions);
  const people = getAllPeople();
  const allContacts = Object.entries(people).filter(([id, p]) => p.contact || p.key);

  const cycleRaci = (decId, personId) => {
    const cycle = [null, "R", "A", "C", "I"];
    setDecisions(prev => prev.map(d => {
      if (d.id !== decId) return d;
      const current = d.assignments[personId] || null;
      const nextIdx = (cycle.indexOf(current) + 1) % cycle.length;
      const next = cycle[nextIdx];
      const newAssignments = { ...d.assignments };
      if (next) newAssignments[personId] = next;
      else delete newAssignments[personId];
      return { ...d, assignments: newAssignments };
    }));
  };

  const updateLabel = (decId, newLabel) => {
    setDecisions(prev => prev.map(d => d.id === decId ? { ...d, label: newLabel } : d));
  };

  const addDecision = () => {
    setDecisions(prev => [...prev, { id: `dec_${Date.now()}`, label: "New Decision", assignments: {} }]);
  };

  const removeDecision = (decId) => {
    setDecisions(prev => prev.filter(d => d.id !== decId));
  };

  return (
    <div className="overflow-x-auto bg-gray-900 rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="text-xs text-gray-400">Click cells to cycle: R → A → C → I → (empty)</div>
        <button onClick={addDecision} className="text-xs bg-purple-600 hover:bg-purple-500 px-2 py-1 rounded">+ Add Row</button>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left p-2 text-gray-400">Decision</th>
            {allContacts.map(([id, p]) => (
              <th key={id} className="p-2 text-center">
                <div className="text-white font-medium">{p.name.split(' ').pop()}</div>
                <div className="text-gray-500 text-[10px]">{p.title?.split(' ')[0]}</div>
              </th>
            ))}
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody>
          {decisions.map(dec => (
            <tr key={dec.id} className="border-b border-gray-800 hover:bg-gray-800">
              <td className="p-2">
                <input type="text" value={dec.label} onChange={e => updateLabel(dec.id, e.target.value)}
                  className="bg-transparent text-gray-300 font-medium border-b border-transparent hover:border-gray-600 focus:border-purple-500 focus:outline-none w-full" />
              </td>
              {allContacts.map(([pId]) => (
                <td key={pId} className="p-2 text-center cursor-pointer hover:bg-gray-700 rounded" onClick={() => cycleRaci(dec.id, pId)}>
                  {dec.assignments[pId] && (
                    <span className="font-bold text-sm" style={{ color: raciColors[dec.assignments[pId]] }}>{dec.assignments[pId]}</span>
                  )}
                </td>
              ))}
              <td className="p-1">
                <button onClick={() => removeDecision(dec.id)} className="text-gray-600 hover:text-red-400 text-xs">✕</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-4 mt-3 text-xs text-gray-500">
        <span><span className="font-bold" style={{ color: raciColors.R }}>R</span> Responsible</span>
        <span><span className="font-bold" style={{ color: raciColors.A }}>A</span> Accountable</span>
        <span><span className="font-bold" style={{ color: raciColors.C }}>C</span> Consulted</span>
        <span><span className="font-bold" style={{ color: raciColors.I }}>I</span> Informed</span>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState("network");
  const [showNetwork, setShowNetwork] = useState(false);

  return (
    <div className="bg-gray-950 p-4 text-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-bold">JPMC Organization Map</h1>
            <p className="text-gray-500 text-xs">Horizontal shared functions + Vertical BUs | CB merged into CIB Q2 2024</p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex gap-1 bg-gray-800 p-1 rounded-lg">
              {[{ id: "network", label: "Network" }, { id: "org", label: "Org View" }, { id: "matrix", label: "RACI" }].map(tab => (
                <button key={tab.id} onClick={() => setView(tab.id)}
                  className={`px-3 py-1.5 rounded text-sm ${view === tab.id ? "bg-purple-600" : "text-gray-400 hover:text-white"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
            {view === "org" && (
              <label className="flex items-center gap-2 text-xs text-gray-400 ml-2 cursor-pointer">
                <input type="checkbox" checked={showNetwork} onChange={e => setShowNetwork(e.target.checked)} className="rounded bg-gray-700 border-gray-600" />
                Network lines
              </label>
            )}
          </div>
        </div>
        {view === "org" && <OrgView showNetwork={showNetwork} />}
        {view === "network" && <NetworkGraph />}
        {view === "matrix" && <DecisionMatrix />}
        <div className="mt-4 flex justify-between items-center text-xs text-gray-600">
          <div>★ Key Decision Maker | ● Active Contact | Click BU ▶ to expand teams</div>
          <div>Last updated: Dec 15, 2025</div>
        </div>
      </div>
    </div>
  );
}
