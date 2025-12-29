import { useEffect, useMemo, useState } from 'react'
import type { User } from '../lib/schemas'
import { db } from '../lib/schemas'
import { useNavigate } from 'react-router-dom'
import guruChallengeImg from '../assets/guru.svg'
import differentanswersImg from '../assets/different-answers.svg'
import perfectshotImg from '../assets/perfect-shot.svg'

// Define a story section with text, image
interface StorySection {
  heading: string;
  content: string;
  imageUrl: string;  // Placeholder for now, can be replaced with actual illustrations
}

// Define a story structure for Gita knowledge
interface Story {
  id: number;
  title: string;
  sections: StorySection[];
  lesson: string;  // "What We Learn" section
  audioUrl?: string;  // Will be generated via Azure TTS
}

const GITA_STORIES: Story[] = [
  {
    id: 1,
    title: 'Focus Like Arjuna',
    sections: [
      {
        heading: "The Guru's Challenge",
        content: "Once, in ancient India, there was a great archer named Arjuna who studied under his teacher, Dronacharya. One sunny morning, the guru decided to test all his students. He placed a wooden bird high up in a tree and asked each student to prepare to shoot it.",
        imageUrl: '/images/gita/arjuna-1.jpg'  // Placeholder
      },
      {
        heading: "Different Answers",
        content: "Before allowing anyone to shoot, Dronacharya asked each student, 'What do you see?' The first student said, 'I see the tree, the sky, birds flying, and the wooden bird.' The second student said, 'I see the branches, leaves, and the bird.' Each student listed many things they could see around them.",
        imageUrl: '/images/gita/arjuna-2.jpg'
      },
      {
        heading: "The Perfect Shot",
        content: "When it was Arjuna's turn, his teacher asked the same question. Arjuna looked intently and replied, 'I see only the eye of the bird.' The teacher was pleased and asked, 'Not the tree? Not the branches? Not the sky?' Arjuna answered, 'No, guru. Only the bird's eye.' With that focus, Arjuna released his arrow and hit the exact center of the bird's eye perfectly.",
        imageUrl: '/images/gita/arjuna-3.jpg'
      }
    ],
    lesson: "When you focus on one thing with complete attention, distractions fade away and you become powerful. Like Arjuna, when you do homework, play a game, or help someone, give it your full focus. Magic happens when your mind is completely present.",
    audioUrl: '/audio/gita/story-1.mp3'  // Will be generated via Azure TTS
  },
  {
    id: 2,
    title: 'Krishna and the Broken Pot',
    sections: [
      {
        heading: "The Mischievous Boy",
        content: "Young Krishna loved butter more than anything. His mother Yashoda would store freshly churned butter in clay pots hung high from the ceiling. But Krishna, clever as he was, would climb on his friends' shoulders and steal the butter when no one was watching.",
        imageUrl: '/images/gita/krishna-1.jpg'
      },
      {
        heading: "Caught in the Act",
        content: "One day, Yashoda caught Krishna with butter smeared all over his face and hands. The broken pot lay on the floor. She was angry and demanded, 'Krishna! Did you steal the butter again?' Little Krishna looked up with innocent eyes and said, 'Mother, if you gave me this body, this hunger, and placed the butter within my reach, how can you be angry with me for following my nature?'",
        imageUrl: '/images/gita/krishna-2.jpg'
      },
      {
        heading: "The Deeper Lesson",
        content: "Yashoda laughed despite herself. She realized that Krishna was teaching her something profound - that we shouldn't be angry at life's challenges, as they're part of the divine plan. Everything happens for a reason, and even mischief has a purpose in the grand design of the universe.",
        imageUrl: '/images/gita/krishna-3.jpg'
      }
    ],
    lesson: "Don't blame yourself or others for following your true nature. Understanding and acceptance lead to peace. Everything in life happens for a reason, even the things that seem wrong at first.",
    audioUrl: '/audio/gita/story-2.mp3'
  },
  {
    id: 3,
    title: 'The Two Birds on a Tree',
    sections: [
      {
        heading: "An Ancient Riddle",
        content: "The Gita tells us about two birds sitting on the same tree. One bird hops from branch to branch, tasting every fruit - some sweet, some bitter, some sour. This bird is sometimes happy, sometimes sad, always busy trying different fruits.",
        imageUrl: '/images/gita/birds-1.jpg'
      },
      {
        heading: "The Silent Watcher",
        content: "The other bird sits quietly on a higher branch. It doesn't eat any fruit. It simply watches the first bird with love and patience. This bird is always peaceful, never worried, never upset. It just observes everything with calm eyes.",
        imageUrl: '/images/gita/birds-2.jpg'
      },
      {
        heading: "Who Are These Birds?",
        content: "The first bird represents our mind - always jumping from one thought to another, one desire to another, sometimes happy, sometimes sad. The second bird represents our true self, our soul - the part of us that can watch our own thoughts and feelings without being disturbed. When we learn to be like the second bird, we find real peace.",
        imageUrl: '/images/gita/birds-3.jpg'
      }
    ],
    lesson: "Inside you are two parts - the busy mind that worries and wants things, and the peaceful soul that simply watches. When you can observe your own thoughts and feelings without getting too excited or upset, you discover inner peace and wisdom.",
    audioUrl: '/audio/gita/story-3.mp3'
  },
  {
    id: 4,
    title: 'The Chariot and the Horses',
    sections: [
      {
        heading: "Arjuna's Battle Chariot",
        content: "Before the great battle, Krishna explained to Arjuna about a chariot. In a chariot, there are wild horses that pull it forward with great power. These horses are strong but don't know where to go. They could run the chariot into a ditch or off a cliff if not guided properly.",
        imageUrl: '/images/gita/chariot-1.jpg'
      },
      {
        heading: "The Wise Charioteer",
        content: "That's why we need a charioteer - someone who holds the reins and guides the horses. The charioteer must be wise, calm, and know the right path. Without a good charioteer, even the strongest horses will cause disaster. With a good charioteer, the horses' power is used for reaching the goal safely.",
        imageUrl: '/images/gita/chariot-2.jpg'
      },
      {
        heading: "You Are the Chariot",
        content: "Krishna explained: Your body is the chariot. Your emotions and desires are the wild horses - powerful but directionless. Your mind should be the wise charioteer, guiding everything with intelligence and control. And your soul is the passenger, the real you, watching this amazing journey of life.",
        imageUrl: '/images/gita/chariot-3.jpg'
      }
    ],
    lesson: "Your emotions are powerful like horses, but they need to be guided by your intelligent mind. When your mind is in control, your powerful feelings work for you instead of against you. Learn to be the wise charioteer of your own life.",
    audioUrl: '/audio/gita/story-4.mp3'
  },
  {
    id: 5,
    title: 'The Story of Duryodhana and Pandavas',
    sections: [
      {
        heading: "Two Cousins, Two Paths",
        content: "Long ago, there were two sets of cousins - the five Pandava brothers and their hundred cousins led by Duryodhana. They were all raised together, learned from the same teachers, and lived in the same palace. But they made very different choices in life.",
        imageUrl: '/images/gita/pandavas-1.jpg'
      },
      {
        heading: "The Choice of Greed",
        content: "Duryodhana had everything - wealth, power, a kingdom - but he wanted more. He was jealous of the Pandavas and wanted their share too. He lied, cheated, and even tried to kill his cousins to get what he wanted. His heart was filled with anger and greed.",
        imageUrl: '/images/gita/pandavas-2.jpg'
      },
      {
        heading: "The Choice of Dharma",
        content: "The Pandavas, even when they lost everything and had to live in the forest, never stopped doing what was right. They spoke the truth, helped others, and stayed kind even to those who hurt them. They chose dharma (righteousness) over easy victories. In the end, this choice made all the difference.",
        imageUrl: '/images/gita/pandavas-3.jpg'
      }
    ],
    lesson: "Every day we make choices - to be truthful or to lie, to be kind or mean, to share or to be greedy. Like the Pandavas, choose the path of goodness even when it's difficult. These small daily choices shape who we become and determine our destiny.",
    audioUrl: '/audio/gita/story-5.mp3'
  },
  {
    id: 6,
    title: 'The Lotus in the Pond',
    sections: [
      {
        heading: "Beauty from Mud",
        content: "Krishna once showed Arjuna a beautiful lotus flower floating on a pond. Its white petals were pure and perfect, glowing in the sunlight. Arjuna admired its beauty. Then Krishna asked him to look beneath the water.",
        imageUrl: '/images/gita/lotus-1.jpg'
      },
      {
        heading: "Growing Through Darkness",
        content: "Below the surface, Arjuna saw that the lotus grew from thick, dark mud at the bottom of the pond. Its roots were buried deep in the murk. The stem traveled through muddy water before finally reaching the surface. Yet the flower remained spotlessly clean, untouched by all the dirt below.",
        imageUrl: '/images/gita/lotus-2.jpg'
      },
      {
        heading: "Living in the World",
        content: "Krishna explained: 'Be like the lotus, Arjuna. Live in this world, go to school, play, work, face problems and challenges - but don't let negativity stick to your heart. Just as water drops roll off the lotus petals, let bad experiences and negative feelings roll off you. Stay pure within.'",
        imageUrl: '/images/gita/lotus-3.jpg'
      }
    ],
    lesson: "You will face difficulties, see bad things, and encounter negative people. But like the lotus, you can remain pure and beautiful inside. Don't let the 'mud' of the world make you dirty. Let it make you stronger and more beautiful instead.",
    audioUrl: '/audio/gita/story-6.mp3'
  },
  {
    id: 7,
    title: 'The Bhagavad Gita Battlefield',
    sections: [
      {
        heading: "Arjuna's Doubt",
        content: "The great warrior Arjuna stood on the battlefield, his bow in hand, ready to fight. But when he looked across and saw his own cousins, teachers, and loved ones on the opposing side, his hands began to shake. 'How can I fight my own family?' he thought. 'Even if I win, what victory is this?' He put down his bow and refused to fight.",
        imageUrl: '/images/gita/battlefield-1.jpg'
      },
      {
        heading: "Krishna's Teaching",
        content: "Lord Krishna, his charioteer and friend, then spoke words of wisdom. 'Arjuna, you're not fighting people - you're fighting for what's right. Your cousins have chosen the path of evil, of hurting innocent people. If good people don't stand up to evil, the whole world suffers. Your duty as a warrior is to protect the innocent, even if it's hard.'",
        imageUrl: '/images/gita/battlefield-2.jpg'
      },
      {
        heading: "The Greater Good",
        content: "Krishna continued, 'Sometimes doing the right thing is painful. But we must act according to our dharma - our duty to do good - even when it's difficult. The soul is eternal; what dies is only the body. But the consequences of running from your duty will last forever.' Arjuna understood and picked up his bow to fight for justice.",
        imageUrl: '/images/gita/battlefield-3.jpg'
      }
    ],
    lesson: "Sometimes doing what's right is hard and uncomfortable. You might have to stand up to friends who are doing wrong, or speak truth when others want you to stay quiet. But like Arjuna, you must follow your dharma - do what you know is right - even when it's the harder choice.",
    audioUrl: '/audio/gita/story-7.mp3'
  },
  {
    id: 8,
    title: 'The Three Gunas',
    sections: [
      {
        heading: "Three Types of Energy",
        content: "The Gita teaches that everything in the universe is made of three types of energy called gunas. Imagine three friends who are always with you: Sattva, Rajas, and Tamas. They take turns influencing how you think and act throughout the day.",
        imageUrl: '/images/gita/gunas-1.jpg'
      },
      {
        heading: "Meet the Three Friends",
        content: "Sattva is the friend who makes you feel peaceful, happy, and kind. When Sattva is strong, you want to help others, study well, and do good things. Rajas is the energetic friend who makes you excited and active, but also restless and wanting more and more. Tamas is the lazy friend who makes you feel sleepy, confused, or want to avoid responsibilities.",
        imageUrl: '/images/gita/gunas-2.jpg'
      },
      {
        heading: "Choosing Your Guide",
        content: "Krishna explained that we can't remove these three completely, but we can choose which one leads us. When you eat healthy food, wake up early, think positive thoughts, and help others, Sattva grows stronger. When you fight, demand things angrily, or stay restless, Rajas dominates. When you're lazy, eat too much junk food, or avoid work, Tamas takes over. You get to choose!",
        imageUrl: '/images/gita/gunas-3.jpg'
      }
    ],
    lesson: "Notice which energy is strong in you right now. Are you feeling peaceful and kind (Sattva), restless and demanding (Rajas), or lazy and dull (Tamas)? Make choices that strengthen Sattva - eat well, think positive, help others, and be peaceful. This brings lasting happiness.",
    audioUrl: '/audio/gita/story-8.mp3'
  },
  {
    id: 9,
    title: 'Karma Yoga - The Yoga of Action',
    sections: [
      {
        heading: "The Busy Student",
        content: "A young student once asked Krishna, 'I study hard every day for my exams. But what if I don't get good marks? What if all my hard work is wasted?' The student was so worried about the results that he couldn't enjoy studying anymore. Every day was filled with anxiety about the future.",
        imageUrl: '/images/gita/karma-1.jpg'
      },
      {
        heading: "Krishna's Garden Lesson",
        content: "Krishna took the student to a garden where a farmer was planting seeds. 'Look at this farmer,' Krishna said. 'He prepares the soil carefully, plants each seed with love, waters them regularly, and removes weeds. But can he control the rain? Can he force the sun to shine? Can he make the seed grow faster?' The student said no. 'Exactly!' Krishna smiled.",
        imageUrl: '/images/gita/karma-2.jpg'
      },
      {
        heading: "Focus on the Action",
        content: "'The farmer does his best work and then trusts nature to do its part. He doesn't lose sleep worrying if every seed will sprout. Similarly, you do your best in studies - that's your karma, your action. But the results? They depend on many things beyond your control. Do your duty perfectly, then let go of anxiety about outcomes. This is Karma Yoga - the wisdom of action.'",
        imageUrl: '/images/gita/karma-3.jpg'
      }
    ],
    lesson: "Focus on doing your best in whatever you do - studying, playing, helping others. Do it sincerely and with full effort. But don't worry constantly about the results. Results will come, but your job is to do good action. This removes anxiety and brings peace while you work.",
    audioUrl: '/audio/gita/story-9.mp3'
  },
  {
    id: 10,
    title: 'The Ocean and the Rivers',
    sections: [
      {
        heading: "Many Rivers, One Ocean",
        content: "Krishna once told Arjuna about rivers and the ocean. From all across the land - from mountains, forests, and plains - countless rivers flow. Some are big, some small. Some flow fast, some slow. Some are clear, some muddy. Each river has its own name and path.",
        imageUrl: '/images/gita/ocean-1.jpg'
      },
      {
        heading: "Losing the Name",
        content: "But watch what happens when each river reaches the ocean. The water that was 'Ganga' or 'Yamuna' or any other name, simply becomes ocean. The river doesn't stay separate. It merges completely. It doesn't lose anything - it gains everything. It becomes part of something infinite and powerful.",
        imageUrl: '/images/gita/ocean-2.jpg'
      },
      {
        heading: "Your True Nature",
        content: "'We are like those rivers,' Krishna explained. 'Each person seems different - different names, different bodies, different stories. But our true nature, our soul, is part of the infinite divine consciousness, like rivers are part of the ocean. When you realize this, you understand that we're all connected. Hurting others is hurting yourself. Loving others is loving yourself.'",
        imageUrl: '/images/gita/ocean-3.jpg'
      }
    ],
    lesson: "Though we all look different and have different names, deep down we're all connected to the same divine source. This is why we should treat everyone with kindness and respect. What you do to others, you ultimately do to yourself, because we're all waves in the same ocean.",
    audioUrl: '/audio/gita/story-10.mp3'
  },
  {
    id: 11,
    title: 'The Vishwaroopa - The Universal Form',
    sections: [
      {
        heading: "Arjuna's Request",
        content: "After hearing Krishna's wisdom, Arjuna wanted to see something more. 'You say you're not just my friend, but the supreme divine being who creates and controls everything. Can you show me your true, universal form?' Krishna smiled and said, 'Most people cannot bear to see this. But because you're devoted, I'll grant you divine vision to witness my cosmic form.'",
        imageUrl: '/images/gita/vishwa-1.jpg'
      },
      {
        heading: "The Terrifying Beauty",
        content: "Suddenly, Arjuna saw something beyond imagination. Krishna's body became infinite, containing the entire universe. Arjuna saw countless galaxies, all creatures, past present and future, all gods and demons, the cycle of creation and destruction - everything happening at once. He saw beauty and terror, birth and death, love and war, all as part of one divine being. It was magnificent and frightening at the same time.",
        imageUrl: '/images/gita/vishwa-2.jpg'
      },
      {
        heading: "Return to the Familiar",
        content: "Arjuna was overwhelmed and afraid. He folded his hands and begged, 'This is too much for me to understand! Please return to your gentle form as my friend Krishna.' Krishna, with compassion, returned to his familiar human form. 'Very few can witness this. But remember - behind every small thing, I am present. The divine is in everything, though mostly invisible to human eyes.'",
        imageUrl: '/images/gita/vishwa-3.jpg'
      }
    ],
    lesson: "The divine is in everything around you - in nature, in people, in animals, even in the air you breathe. Though you can't always see it, there's a sacred presence in all of creation. When you remember this, you treat everything and everyone with respect and wonder.",
    audioUrl: '/audio/gita/story-11.mp3'
  },
  {
    id: 12,
    title: 'Detachment and Love',
    sections: [
      {
        heading: "The Crying Child",
        content: "A mother brought her crying child to Krishna. 'Wise one, my child loves sweets too much and eats too many. It's harming his health. Please tell him to stop!' Krishna said, 'Bring him back after two weeks.' Confused but trusting, the mother returned after two weeks. Krishna then told the child, 'Eating too many sweets is bad for you. You should stop.' The child, respecting Krishna, agreed immediately.",
        imageUrl: '/images/gita/detachment-1.jpg'
      },
      {
        heading: "The Puzzling Wait",
        content: "The mother was puzzled. 'Sir, why did you ask me to wait two weeks? You could have told him this the first day!' Krishna smiled and said, 'Two weeks ago, I myself was eating too many sweets. How could I tell someone to stop when I wasn't practicing it myself? I needed those two weeks to stop my own habit first.'",
        imageUrl: '/images/gita/detachment-2.jpg'
      },
      {
        heading: "Practice What You Preach",
        content: "Krishna continued, 'To teach detachment from desires, you must practice it yourself. You can't tell others to be calm if you're always angry. You can't preach kindness while being cruel. True teaching comes from living what you believe. The child listened to me not because of my words, but because he saw I practiced what I preached.'",
        imageUrl: '/images/gita/detachment-3.jpg'
      }
    ],
    lesson: "Before telling others what to do, make sure you're doing it yourself. Actions speak louder than words. If you want others to be kind, be kind first. If you want others to work hard, work hard yourself. Your example is your greatest lesson to the world.",
    audioUrl: '/audio/gita/story-12.mp3'
  }
]

export default function GitaKnowledge() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [audioPlaying, setAudioPlaying] = useState<number | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const user = localStorage.getItem('currentUser')
    if (!user) {
      navigate('/login')
      return
    }
    setCurrentUser(JSON.parse(user))
  }, [navigate])

  // Calculate which chapters are unlocked based on user's join date
  const unlockedChapters = useMemo(() => {
    if (!currentUser?.created_at) return 1

    const joinDate = new Date(currentUser.created_at)
    const today = new Date()
    const daysSinceJoin = Math.floor(
      (today.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    // First 5 chapters: 1 per day (0-4 days = chapters 1-5)
    if (daysSinceJoin < 5) {
      return daysSinceJoin + 1
    }

    // After chapter 5: 1 per week
    // Day 5-11 = chapter 6, Day 12-18 = chapter 7, etc.
    const daysAfterChapter5 = daysSinceJoin - 4
    const weeksAfterChapter5 = Math.floor(daysAfterChapter5 / 7)
    return Math.min(5 + weeksAfterChapter5, 12) // Cap at 12 total chapters
  }, [currentUser])

  // Play or pause audio for a story
  const toggleAudio = (storyId: number, audioUrl?: string) => {
    if (!audioUrl) {
      alert('Audio not yet generated for this story')
      return
    }
    
    if (audioPlaying === storyId) {
      // Pause currently playing audio
      setAudioPlaying(null)
      // TODO: Actually pause the audio element
    } else {
      // Play new audio
      setAudioPlaying(storyId)
      // TODO: Play audio using Azure TTS generated file
      console.log(`Playing audio: ${audioUrl}`)
    }
  }

  if (!currentUser) return null

  return (
    <div className="min-h-screen relative p-8">
      {/* Background SVG */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/src/assets/background of gita module.svg" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-6xl font-bold text-orange-700" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.4)' }}>
            Bhagavad Gita Wisdom for Children
          </h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="mb-8 p-6 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border-2 border-orange-300">
          <p className="text-lg text-gray-700">
            🌟 <strong>Progress:</strong> You have unlocked{' '}
            <span className="text-orange-600 font-bold">{unlockedChapters}</span> out of 12 stories!
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {unlockedChapters < 5
              ? '🌅 New stories unlock every day until chapter 5'
              : unlockedChapters < 12
              ? '📅 New stories unlock every week after chapter 5'
              : '🎉 All stories unlocked! You are a Gita wisdom master!'}
          </p>
        </div>

        <div className="space-y-8">
          {GITA_STORIES.map((story) => {
            const isLocked = story.id > unlockedChapters
            
            return (
              <div
                key={story.id}
                className={`p-6 rounded-xl shadow-lg transition-all ${
                  isLocked
                    ? 'bg-gray-100 opacity-60 cursor-not-allowed'
                    : 'bg-white hover:shadow-xl'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-4xl font-bold text-orange-800">
                    {story.id}. {story.title}
                    {isLocked && ' 🔒'}
                  </h2>
                  {!isLocked && (
                    <button
                      onClick={() => toggleAudio(story.id, story.audioUrl)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                      {audioPlaying === story.id ? '⏸️ Pause' : '▶️ Listen'}
                    </button>
                  )}
                </div>

                {isLocked ? (
                  <p className="text-gray-600 italic">
                    🔒 This story will unlock soon. Keep playing games and come back!
                  </p>
                ) : (
                  <div className="space-y-6">
                    {story.sections.map((section, index) => {
                      const isGuruChallenge = story.title === 'Focus Like Arjuna' && section.heading === "The Guru's Challenge";
                      const isDifferentAnswers = story.title === 'Focus Like Arjuna' && section.heading === "Different Answers";
                      const isPerfectShot = story.title === 'Focus Like Arjuna' && section.heading === "The Perfect Shot";
                      return (
                      <div key={index} className="border-l-4 border-orange-300 pl-4">
                        <h3 className="text-3xl font-bold text-orange-700 mb-3">
                          {section.heading}
                        </h3>
                        {isGuruChallenge && (
                          <img
                            src={guruChallengeImg}
                            alt="The Guru's Challenge"
                          />
                        )}
                        {isDifferentAnswers && (
                          <img
                            src={differentanswersImg}
                            alt="Different Answers"
                          />
                        )}
                        {isPerfectShot && (
                          <img
                            src={perfectshotImg}
                            alt="The Perfect Shot"
                          />
                        )}
                        {!isGuruChallenge && !isDifferentAnswers && !isPerfectShot && (
                          <div className="my-4 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg h-48 flex items-center justify-center border-2 border-orange-200">
                            <div className="text-center text-gray-500">
                              <div className="text-4xl mb-2">🖼️</div>
                              <p className="text-sm">Illustration: {section.heading}</p>
                              <p className="text-xs text-gray-400 mt-1">{section.imageUrl}</p>
                            </div>
                          </div>
                        )}
                        
                        <p className="text-gray-900 leading-relaxed text-2xl font-semibold">
                          {section.content}
                        </p>
                      </div>
                    )})}

                    {/* Lesson section */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border-2 border-orange-300">
                      <h3 className="text-xl font-bold text-orange-700 mb-2 flex items-center gap-2">
                        💡 What We Learn
                      </h3>
                      <p className="text-gray-800 leading-relaxed text-lg">
                        {story.lesson}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer note about audio */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            🎵 <strong>Note:</strong> Audio narration will be generated using Azure Text-to-Speech. 
            Each story will have a professionally narrated audio file that brings the Gita's wisdom to life!
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}
