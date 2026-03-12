const CORE_LESSONS = [
  {
    id: 'l_conf_1',
    trackId: 'confidence_10min',
    trackName: 'Speak confidently in 10 minutes',
    title: '10-Minute Confidence Sprint: Daily Conversation',
    content:
      'Practice high-impact phrases for greetings, transitions, and confident responses in fast real-life chats.',
    language: 'English',
    level: 'Starter',
    estimatedMinutes: 10,
    quiz: [
      {
        question: 'Which phrase sounds most confident in a conversation?',
        options: ['Maybe I can try', 'I am not sure', 'Absolutely, let us do that', 'I think no'],
        answer: 'Absolutely, let us do that',
      },
    ],
  },
  {
    id: 'l_conf_2',
    trackId: 'confidence_10min',
    trackName: 'Speak confidently in 10 minutes',
    title: 'Confidence Boost: Small Talk Builder',
    content:
      'Learn how to keep conversations going with smooth follow-up questions and natural connectors.',
    language: 'English',
    level: 'Starter',
    estimatedMinutes: 10,
    quiz: [
      {
        question: 'Pick the best follow-up question in small talk.',
        options: ['Why?', 'Tell me more about that.', 'Okay', 'I do not know'],
        answer: 'Tell me more about that.',
      },
    ],
  },
  {
    id: 'l_conf_3',
    trackId: 'confidence_10min',
    trackName: 'Speak confidently in 10 minutes',
    title: 'Fast Fluency Drill: Clear Opinion Statements',
    content:
      'Frame concise opinions and speak with clarity using simple sentence patterns under time pressure.',
    language: 'English',
    level: 'Beginner',
    estimatedMinutes: 10,
    quiz: [
      {
        question: 'Which opener is the clearest opinion statement?',
        options: [
          'I am maybe thinking',
          'In my view, this approach is effective.',
          'Maybe no',
          'Do not ask me',
        ],
        answer: 'In my view, this approach is effective.',
      },
    ],
  },
  {
    id: 'l_int_1',
    trackId: 'interview_mastery',
    trackName: 'Ace job interview language skills',
    title: 'Interview Essentials: Introduce Yourself',
    content:
      'Craft a compelling 45-second self-introduction tailored for recruiter and hiring manager conversations.',
    language: 'English',
    level: 'Professional',
    estimatedMinutes: 12,
    quiz: [
      {
        question: 'Which opening is strongest in an interview?',
        options: [
          'I do many things',
          'I am a software engineer focused on building reliable mobile products.',
          'No idea',
          'Just hired me',
        ],
        answer: 'I am a software engineer focused on building reliable mobile products.',
        rubric: {
          weights: { situation: 20, task: 20, action: 30, result: 30 },
          keywords: {
            situation: ['background', 'experience', 'role', 'industry', 'team'],
            task: ['goal', 'responsibility', 'objective', 'deliver', 'ownership'],
            action: ['built', 'designed', 'implemented', 'led', 'shipped'],
            result: ['improved', 'increased', 'reduced', 'impact', 'percent'],
          },
        },
      },
    ],
  },
  {
    id: 'l_int_2',
    trackId: 'interview_mastery',
    trackName: 'Ace job interview language skills',
    title: 'STAR Framework: Answer Behavioral Questions',
    content:
      'Use Situation, Task, Action, Result language to answer leadership and ownership questions clearly.',
    language: 'English',
    level: 'Professional',
    estimatedMinutes: 12,
    quiz: [
      {
        question: 'What does STAR stand for?',
        options: [
          'Skill, Talent, Accuracy, Review',
          'Situation, Task, Action, Result',
          'Speed, Talk, Ask, Reply',
          'None',
        ],
        answer: 'Situation, Task, Action, Result',
        rubric: {
          weights: { situation: 25, task: 20, action: 30, result: 25 },
          keywords: {
            situation: ['situation', 'context', 'challenge', 'problem', 'timeline'],
            task: ['task', 'objective', 'responsible', 'expected', 'target'],
            action: ['i did', 'i led', 'i created', 'i coordinated', 'i delivered'],
            result: ['result', 'outcome', 'achieved', 'improved', 'saved'],
          },
        },
      },
    ],
  },
  {
    id: 'l_int_3',
    trackId: 'interview_mastery',
    trackName: 'Ace job interview language skills',
    title: 'Negotiation Language: Salary and Scope',
    content:
      'Practice respectful negotiation phrases to discuss salary expectations and role boundaries with confidence.',
    language: 'English',
    level: 'Professional',
    estimatedMinutes: 12,
    quiz: [
      {
        question: 'Which sentence is best for salary negotiation?',
        options: [
          'Pay me more',
          'I would like to discuss a range aligned with the role responsibilities and market data.',
          'Any amount',
          'I quit',
        ],
        answer: 'I would like to discuss a range aligned with the role responsibilities and market data.',
        rubric: {
          weights: { situation: 15, task: 20, action: 30, result: 35 },
          keywords: {
            situation: ['market', 'role', 'scope', 'expectation', 'experience'],
            task: ['align', 'discuss', 'responsibility', 'compensation', 'range'],
            action: ['propose', 'negotiate', 'present', 'explain', 'compare'],
            result: ['mutual', 'value', 'fit', 'agreement', 'impact'],
          },
        },
      },
    ],
  },
];

module.exports = {
  CORE_LESSONS,
};
