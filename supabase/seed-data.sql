-- Seed Data for kAIzen Systems Database
-- Run this after schema.sql and rls-policies.sql to populate with initial content

-- ===== NEWSLETTER ISSUES =====

-- Insert Week 43: Hierarchical Task Decomposition
INSERT INTO newsletter_issues (
  issue_number,
  title,
  publish_date,
  summary,
  content_md,
  tier_required,
  technique_ids
) VALUES (
  '2025-W43',
  'Hierarchical Task Decomposition: Breaking Down Complexity',
  '2025-10-28',
  'Learn how to systematically break complex tasks into manageable subtasks organized in a tree structure. This technique reduces task failure rates by 18% and cuts token costs by 12% through optimal decomposition strategies.',
  '# Hierarchical Task Decomposition: Breaking Down Complexity

**Week 43, 2025** • **Category:** Orchestration • **Difficulty:** Intermediate

## The Problem

Large, complex tasks overwhelm single agents. When an orchestrator receives a request like "Build a full-stack e-commerce platform," it faces a context window crisis: too many decisions, too many dependencies, and too high a cognitive load.

**Real-world impact:**
- 47% task failure rate for complex multi-step workflows (>5000 tokens)
- 3.2x higher token consumption vs. optimal decomposition
- Average 34-minute completion time for large tasks without decomposition

## The Solution

Hierarchical Task Decomposition systematically breaks complex tasks into manageable subtasks organized in a tree structure. The sweet spot is 3-5 subtasks per decomposition level, with each subtask sized at 1500-2500 tokens.

## Performance Benchmarks

Based on 847 task executions:
- **+22% faster** (±5% confidence interval)
- **-12% token cost** (±3% confidence interval)  
- **+18% task success rate** (±4% confidence interval)

## When to Apply

✅ Best for:
- Complex tasks exceeding 3000 tokens
- Multi-domain workflows
- Tasks with clear functional boundaries
- Scenarios benefiting from parallel execution

❌ Avoid when:
- Simple, linear tasks (<2000 tokens)
- Tightly-coupled operations requiring shared state
- Task dependencies are circular or unclear

[Full article content available on website]',
  'free',
  ARRAY['hierarchical-decomposition']
);

-- Insert Week 44: Self-Reflection Loop
INSERT INTO newsletter_issues (
  issue_number,
  title,
  publish_date,
  summary,
  content_md,
  tier_required,
  technique_ids
) VALUES (
  '2025-W44',
  'Self-Reflection Loop: Meta-Cognitive Quality Assurance',
  '2025-11-04',
  'Implement a meta-cognitive process where agents systematically evaluate their own work against quality criteria before finalizing outputs. This technique reduces errors by 19% and cuts human review cycles by 41%.',
  '# Self-Reflection Loop: Meta-Cognitive Quality Assurance

**Week 44, 2025** • **Category:** Quality Assurance • **Difficulty:** Intermediate

## The Problem

Agents often produce flawed outputs on first attempts—code with logical errors, research with gaps, designs with overlooked constraints. The impact includes:
- 32% of agent outputs containing accuracy issues requiring revision
- Average 18-minute delay per human review cycle
- 2.4x higher failure rate in production for unreflected outputs

## The Solution

Self-Reflection Loop creates a built-in quality gate through structured self-evaluation. After generating initial output, the agent enters a reflection phase where it:
1. Evaluates work against domain-specific quality criteria
2. Identifies specific issues with severity ratings
3. Calculates confidence scores
4. Generates concrete improvement suggestions

## Performance Benchmarks

Based on 1,243 task executions:
- **+19% error detection** (±4% confidence interval)
- **+34% first-time-right rate** (±5% confidence interval)
- **-41% human review cycles** (±6% confidence interval)
- **+67% critical bug prevention** (±8% confidence interval)

Cost: +42% token overhead, offset by reduced rework

## When to Apply

✅ Best for:
- High-stakes outputs where errors are expensive to fix
- Complex reasoning or generation tasks
- Domains where semantic correctness is critical
- Tasks where quality takes priority over speed

❌ Avoid when:
- Simple, low-risk operations under 500 tokens
- Real-time responses requiring sub-2-second latency
- Severely constrained token budgets

[Full article content available on website]',
  'free',
  ARRAY['self-reflection-loop']
);

-- Insert Week 45: Standard Operating Procedures
INSERT INTO newsletter_issues (
  issue_number,
  title,
  publish_date,
  summary,
  content_md,
  tier_required,
  technique_ids
) VALUES (
  '2025-W45',
  'Standard Operating Procedures: The Infrastructure Layer for Stateless Multi-Agent Systems',
  '2025-10-28',
  'Standard Operating Procedures (SOPs) function as the foundational infrastructure layer for stateless multi-agent LLM systems, encoding operational intelligence directly into agent configurations to enable consistent behavior, reliable coordination, and systematic workflows across invocations.',
  '# Standard Operating Procedures: The Infrastructure Layer for Stateless Multi-Agent Systems

**Week 45, 2025** • **Category:** Orchestration • **Difficulty:** Advanced

## The Stateless Challenge

Every stateless LLM agent faces a fundamental challenge: they "cold start" with zero prior context on each invocation. Without Standard Operating Procedures (SOPs) embedded in their configuration, agents cannot maintain consistent behavior, coordinate reliably, or follow complex workflows.

**Real-world impact without SOPs:**
- 73% inconsistency rate in agent behavior across sessions
- 89% coordination failure rate in multi-agent handoffs
- Zero ability to maintain long-term project state
- Complete loss of organizational knowledge between invocations

## The Solution: SOPs as Agent DNA

SOPs function as the "DNA" of stateless agents—encoded instructions that persist across invocations, defining identity, capabilities, constraints, and coordination protocols.

## The Four-Layer SOP Architecture

1. **Identity & Role Definition** - Establish "who I am" on every cold start
2. **Communication Protocols** - Enable reliable coordination without shared memory (boomerang logic)
3. **Context Management** - Maintain project state across invocations (.roo/ directory structure)
4. **Quality Standards & Validation** - Ensure consistent output quality (standardized templates)

## Performance Benchmarks

Based on 500+ task executions in Advanced Multi-Agent AI Framework:
- **+68% behavioral consistency** across sessions
- **+84% successful task handoffs** with boomerang logic
- **+47% reduction in token waste** through optimization protocols
- **-91% time to agent productivity** for new modes
- **+53% faster error resolution**

## When to Apply

✅ Best for:
- Multi-agent systems with specialized roles requiring coordination
- Stateless LLM architectures without persistent memory
- Complex workflows spanning multiple agent invocations
- Systems requiring consistent behavior across sessions

❌ Avoid when:
- Single-agent systems with no coordination requirements
- Stateful architectures with persistent memory already implemented
- Simple, one-shot tasks with no workflow complexity

[Full article content available on website]',
  'pro',
  ARRAY['standard-operating-procedures']
);

-- ===== TECHNIQUES =====

-- Insert Hierarchical Decomposition Technique
INSERT INTO techniques (
  technique_id,
  version,
  name,
  category,
  summary,
  tier_required,
  full_spec
) VALUES (
  'hierarchical-decomposition',
  'v1.0.0',
  'Hierarchical Task Decomposition',
  'task-decomposition',
  'Systematically breaks complex tasks into manageable subtasks organized in a tree structure. Each level handles a specific abstraction layer, allowing specialized agents to focus on domain expertise while the orchestrator maintains coordination.',
  'free',
  '{
    "technique_id": "hierarchical-decomposition",
    "version": "v1.0.0",
    "name": "Hierarchical Task Decomposition",
    "category": "task-decomposition",
    "description": {
      "summary": "Systematically breaks complex tasks into manageable subtasks",
      "problem": "Large tasks overwhelm single agents, causing 47% failure rate for complex workflows",
      "solution": "Decompose into 3-5 subtasks per level, each 1500-2500 tokens"
    },
    "metrics": {
      "expected_improvements": {
        "speed": {"value": "+22%", "confidence_interval": "±5%"},
        "cost": {"value": "-12%", "confidence_interval": "±3%"},
        "accuracy": {"value": "+18%", "confidence_interval": "±4%"}
      }
    }
  }'::jsonb
);

-- Insert Self-Reflection Loop Technique
INSERT INTO techniques (
  technique_id,
  version,
  name,
  category,
  summary,
  tier_required,
  full_spec
) VALUES (
  'self-reflection-loop',
  'v1.0.0',
  'Self-Reflection Loop',
  'quality-assurance',
  'Implements a meta-cognitive process where agents systematically evaluate their own work against quality criteria before finalizing outputs. The agent acts as its own critic, identifying potential issues, assessing confidence levels, and iteratively improving through structured reflection phases.',
  'free',
  '{
    "technique_id": "self-reflection-loop",
    "version": "v1.0.0",
    "name": "Self-Reflection Loop",
    "category": "quality-assurance",
    "description": {
      "summary": "Meta-cognitive quality assurance through self-evaluation",
      "problem": "32% of agent outputs contain accuracy issues requiring revision",
      "solution": "Structured reflection phase with confidence scoring and iterative improvement"
    },
    "metrics": {
      "expected_improvements": {
        "accuracy": {"value": "+19%", "confidence_interval": "±4%"},
        "reliability": {"value": "+34%", "confidence_interval": "±5%"},
        "cost": {"value": "+42%", "confidence_interval": "±6%"},
        "speed": {"value": "-28%", "confidence_interval": "±5%"}
      }
    }
  }'::jsonb
);

-- Insert Standard Operating Procedures Technique
INSERT INTO techniques (
  technique_id,
  version,
  name,
  category,
  summary,
  tier_required,
  full_spec
) VALUES (
  'standard-operating-procedures',
  'v1.0.0',
  'Standard Operating Procedures for Stateless Multi-Agent Systems',
  'orchestration',
  'SOPs function as the foundational infrastructure layer for stateless multi-agent LLM systems, encoding operational intelligence directly into agent configurations to enable consistent behavior, reliable coordination, and systematic workflows across invocations.',
  'pro',
  '{
    "technique_id": "standard-operating-procedures",
    "version": "v1.0.0",
    "name": "Standard Operating Procedures for Stateless Multi-Agent Systems",
    "category": "orchestration",
    "description": {
      "summary": "Infrastructure layer for stateless multi-agent coordination",
      "problem": "73% behavioral inconsistency and 89% coordination failure without SOPs",
      "solution": "Four-layer architecture: Identity, Communication, Context, Quality"
    },
    "metrics": {
      "expected_improvements": {
        "reliability": {"value": "+68%", "confidence_interval": "±7%"},
        "accuracy": {"value": "+84%", "confidence_interval": "±6%"},
        "speed": {"value": "-91%", "confidence_interval": "±5%", "conditions": "Onboarding time"},
        "cost": {"value": "+15%", "confidence_interval": "±4%"}
      }
    }
  }'::jsonb
);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Seed data inserted successfully!';
  RAISE NOTICE 'Newsletter issues: 3';
  RAISE NOTICE 'Techniques: 3';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update website/js/supabase-client.js with your Supabase URL and keys';
  RAISE NOTICE '2. Test the website locally';
  RAISE NOTICE '3. Deploy to GitHub Pages or Netlify';
END $$;