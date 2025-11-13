import {RolePlayScenarioConfig} from '../types';

export const meetingSomeoneNewScenario: RolePlayScenarioConfig = {
  id: 'meetingSomeoneNew',
  title: 'Meeting Someone New',
  introEn:
    'You’ve just met someone at an event. You’re introducing yourself and asking about them.',
  introIt:
    'Hai appena conosciuto qualcuno a un evento. Ti presenti e fai domande per conoscerlo meglio.',
  levels: [
    {
      id: 'beginner',
      label: 'Beginner',
      conversation: [
        {
          tutor: () => 'Hi there! I don’t think we’ve met. What’s your name?',
          user: () => 'Hi, I’m Giulia. What’s your name?',
        },
        {
          tutor: () => 'Hi Giulia! I’m Sarah. Nice to meet you.',
          user: () => 'Nice to meet you too. Where are you from?',
        },
        {
          tutor: () => 'I’m from London. And you?',
          user: () => 'I’m from Italy.',
        },
        {
          tutor: () => 'Oh, nice! Do you like London?',
          user: () => 'Yes, it’s beautiful.',
        },
      ],
    },
    {
      id: 'intermediate',
      label: 'Intermediate',
      conversation: [
        {
          tutor: (studentName) =>
            `Hi ${studentName}, is this your first time at this event?`,
          user: () =>
            'It’s my first time. I’m from Milan, but I travel to London quite often.',
        },
        {
          tutor: () => 'Oh really? What do you do there?',
          user: () => 'I usually visit friends or go to English courses.',
        },
        {
          tutor: () => 'That’s great! How long have you been studying English?',
          user: () => 'For about two years.',
        },
        {
          tutor: () => 'Nice! You sound confident.',
          user: () => 'Thanks! I practice as much as I can.',
        },
      ],
    },
    {
      id: 'advanced',
      label: 'Advanced',
      conversation: [
        {
          tutor: (studentName) =>
            `Hi ${studentName}! What line of work are you in?`,
          user: () => 'I work in education. What about you?',
        },
        {
          tutor: () => 'I’m in design. That’s great — I love education!',
          user: () => 'Thanks! It’s a very rewarding job.',
        },
        {
          tutor: () => 'I can imagine. What kind of students do you teach?',
          user: () => 'Mostly adults who want to improve their communication skills.',
        },
        {
          tutor: () =>
            'That’s interesting — must be very inspiring.',
          user: () => 'It really is. I learn a lot from them too.',
        },
      ],
    },
  ] as const,
};


