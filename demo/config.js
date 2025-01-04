/** Check out https://simpleicons.org/?q=html for the icons you can use. */
const BASE_PATH= 'https://cdn.jsdelivr.net/npm/simple-icons@14.0.1/icons/';

function toIconPath(name) {
  return `${BASE_PATH}${name}.svg`;
}

export const skillConfig = {
    numPortraits: 1,
    defaultStats: {
        'Frontend': 10,
        'AI Integration': 10,
        'Product Strategy': 10,
        'Reliability': 10
    },
    skills: [
        // Frontend Development Branch
        {
            id: 1,
            title: 'Web UI Development',
            description: 'Proficient in building seamless, responsive user experiences across devices.',
            maxPoints: 3,
            rankDescriptions: [
                'Basic responsive layouts',
                'Advanced UI components',
                'Complex interactive experiences'
            ],
            stats: [
                { title: 'Frontend', value: 2 }
            ],
            talents: ['UI/UX'],
            iconPath: toIconPath('htmx'),
        },
        {
            id: 2,
            title: 'Cross-Platform Development',
            description: 'Experienced in Android & iOS cross-platform development ensuring consistent user experience.',
            dependsOn: [1],
            maxPoints: 3,
            rankDescriptions: [
                'Basic mobile layouts',
                'Platform-specific features',
                'Advanced mobile optimization'
            ],
            stats: [
                { title: 'Frontend', value: 2 }
            ],
            talents: ['Mobile Development'],
            iconPath: toIconPath('android'),
        },

        // AI Integration Branch
        {
            id: 3,
            title: 'Generative AI Integration',
            description: 'Expertise in integrating generative AI into existing applications.',
            maxPoints: 3,
            rankDescriptions: [
                'Basic AI implementation',
                'Advanced AI features',
                'Complex AI systems'
            ],
            stats: [
                { title: 'AI Integration', value: 2 }
            ],
            talents: ['AI Systems'],
            iconPath: toIconPath('googlegemini'),
        },
        {
            id: 4,
            title: 'AI-Powered Tools',
            description: 'Skilled in developing AI-powered tools that provide contextual and personalized responses.',
            dependsOn: [3],
            maxPoints: 3,
            rankDescriptions: [
                'Basic AI tools',
                'Contextual responses',
                'Advanced personalization'
            ],
            stats: [
                { title: 'AI Integration', value: 2 }
            ],
            talents: ['AI Tools'],
            iconPath: toIconPath('gnometerminal'),
        },

        // Product Strategy Branch
        {
            id: 5,
            title: 'Product Strategy',
            description: 'Strong product thinking abilities with focus on understanding user needs.',
            maxPoints: 3,
            rankDescriptions: [
                'Basic product planning',
                'User needs analysis',
                'Strategic planning'
            ],
            stats: [
                { title: 'Product Strategy', value: 2 }
            ],
            talents: ['Strategy'],
            iconPath: toIconPath('figma'),
        },
        {
            id: 6,
            title: 'Rapid Prototyping',
            description: 'Proven ability to rapidly prototype and iterate on ideas.',
            dependsOn: [5],
            maxPoints: 3,
            rankDescriptions: [
                'Basic prototyping',
                'Iteration methods',
                'Advanced validation'
            ],
            stats: [
                { title: 'Product Strategy', value: 2 }
            ],
            talents: ['Prototyping'],
            iconPath: toIconPath('excalidraw'),
        },

        // Reliability Branch
        {
            id: 7,
            title: 'System Reliability',
            description: 'Experienced in implementing systems for reliability and continuous availability.',
            maxPoints: 3,
            rankDescriptions: [
                'Basic monitoring',
                'System optimization',
                'High availability'
            ],
            stats: [
                { title: 'Reliability', value: 2 }
            ],
            talents: ['Systems'],
            iconPath: toIconPath('amazoncloudwatch'),
        },
        {
            id: 8,
            title: 'Quality Assurance',
            description: 'Strong focus on quality assurance through iterative testing and evaluations.',
            dependsOn: [7],
            maxPoints: 3,
            rankDescriptions: [
                'Basic testing',
                'Advanced QA',
                'Performance optimization'
            ],
            stats: [
                { title: 'Reliability', value: 2 }
            ],
            talents: ['Quality'],
            iconPath: toIconPath('protodotio'),
        }
    ]
};