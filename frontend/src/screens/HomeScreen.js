import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLessons, fetchProgress, logoutUser, submitProgress } from '../redux/store';

const TRACKS = [
  {
    id: 'confidence_10min',
    title: 'Speak confidently in 10 minutes',
    subtitle: 'Fast daily drills to make you sound clear, fluent, and confident.',
  },
  {
    id: 'interview_mastery',
    title: 'Ace job interview language skills',
    subtitle: 'Professional communication drills for interviews, STAR answers, and negotiation.',
  },
];

const SIMULATION_DURATION_SECONDS = 90;

const buildInterviewRounds = (interviewLessons) =>
  interviewLessons.map((lesson, index) => ({
    id: lesson.id,
    title: lesson.title,
    prompt:
      lesson.quiz?.[0]?.question ||
      `Round ${index + 1}: Answer clearly with Situation, Task, Action, and Result.`,
    rubric: lesson.quiz?.[0]?.rubric,
  }));

const buildSuggestedStarAnswer = (prompt, missingSections = [], role = 'Professional') => {
  const cue = prompt || 'a common interview challenge';
  const normalizedRole = String(role || '').toLowerCase();

  const rolePhrases = normalizedRole.includes('product')
    ? {
        situationBase: 'as a product manager working across design, engineering, and business teams',
        actionBase: 'I prioritized roadmap outcomes, aligned stakeholders, and drove crisp decision-making',
        resultBase: 'we shipped faster and improved activation and retention metrics',
      }
    : normalizedRole.includes('data')
      ? {
          situationBase: 'as a data analyst supporting product and operations decisions',
          actionBase: 'I cleaned noisy datasets, built clear dashboards, and translated insights into actions',
          resultBase: 'decision quality improved and we reduced reporting delays significantly',
        }
      : {
          situationBase: 'as a software engineer delivering mobile product features under deadlines',
          actionBase: 'I designed reliable implementations, improved collaboration, and removed delivery blockers',
          resultBase: 'release quality increased and we shipped key milestones earlier',
        };

  const emphasis = {
    situation: missingSections.includes('situation')
      ? 'In my previous role, we were facing a clear communication gap in a high-priority project.'
      : `In my previous role ${rolePhrases.situationBase}, I worked in a fast-paced team with clear delivery targets.`,
    task: missingSections.includes('task')
      ? 'My task was to stabilize communication, align stakeholders, and deliver on time.'
      : 'My task was to keep delivery quality high while meeting strict deadlines.',
    action: missingSections.includes('action')
      ? 'I introduced a concise daily update format, clarified ownership, and proactively handled blockers.'
      : `${rolePhrases.actionBase}, and executed with measurable checkpoints.`,
    result: missingSections.includes('result')
      ? 'As a result, we improved response time by 30% and delivered the milestone one week early.'
      : `As a result, ${rolePhrases.resultBase}.`,
  };

  return [
    `For the question about ${cue.toLowerCase()}, you can answer like this:`,
    emphasis.situation,
    emphasis.task,
    emphasis.action,
    emphasis.result,
  ].join(' ');
};

const countKeywordHits = (text, keywords = []) => {
  const value = (text || '').toLowerCase();
  return keywords.reduce((count, keyword) => {
    if (!keyword) {
      return count;
    }
    return value.includes(String(keyword).toLowerCase()) ? count + 1 : count;
  }, 0);
};

const evaluateStarResponse = (text, rubric, role) => {
  const value = (text || '').toLowerCase();

  const defaultWeights = { situation: 25, task: 25, action: 25, result: 25 };
  const weights = rubric?.weights || defaultWeights;

  const keywordHits = {
    situation: countKeywordHits(value, rubric?.keywords?.situation || []),
    task: countKeywordHits(value, rubric?.keywords?.task || []),
    action: countKeywordHits(value, rubric?.keywords?.action || []),
    result: countKeywordHits(value, rubric?.keywords?.result || []),
  };

  const checks = {
    situation:
      /situation|context|at my previous|in my previous|in my role|when i was/.test(value) ||
      keywordHits.situation > 0,
    task:
      /task|goal|objective|responsible|needed to|was asked to/.test(value) ||
      keywordHits.task > 0,
    action:
      /i (led|built|created|implemented|designed|organized|coordinated|improved|analyzed|launched)/.test(value) ||
      keywordHits.action > 0,
    result:
      /result|impact|increased|reduced|improved|achieved|delivered|saved|%|\d+/.test(value) ||
      keywordHits.result > 0,
  };

  const scaledScore = (isMatched, weight, hits) => {
    if (!isMatched) {
      return 0;
    }
    const hitBoost = Math.min(hits, 2) * 0.15;
    return Math.min(Math.round(weight * (0.85 + hitBoost)), weight);
  };

  const breakdown = {
    situation: scaledScore(checks.situation, weights.situation || 25, keywordHits.situation),
    task: scaledScore(checks.task, weights.task || 25, keywordHits.task),
    action: scaledScore(checks.action, weights.action || 25, keywordHits.action),
    result: scaledScore(checks.result, weights.result || 25, keywordHits.result),
  };

  const score = breakdown.situation + breakdown.task + breakdown.action + breakdown.result;

  const missingSections = Object.entries(checks)
    .filter(([, matched]) => !matched)
    .map(([section]) => section);

  const strongestSection = Object.entries(breakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'action';
  const missingText =
    missingSections.length > 0
      ? `To improve, add clearer ${missingSections.join(', ')} details.`
      : 'Great STAR balance across all sections.';

  const feedback =
    `Strongest section: ${strongestSection}. ` +
    `${missingText} ` +
    'Try to include one measurable outcome to make your answer more convincing.';

  return {
    score,
    breakdown,
    feedback,
    keywordHits,
    missingSections,
  };
};

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items, progress, isLoading, error } = useSelector((state) => state.lessons);
  const [activeLesson, setActiveLesson] = React.useState(null);
  const [selectedOption, setSelectedOption] = React.useState('');
  const [quizResult, setQuizResult] = React.useState(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = React.useState(false);
  const [selectedTrack, setSelectedTrack] = React.useState(TRACKS[0].id);
  const [simulationVisible, setSimulationVisible] = React.useState(false);
  const [simulationRounds, setSimulationRounds] = React.useState([]);
  const [currentRound, setCurrentRound] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(SIMULATION_DURATION_SECONDS);
  const [answerText, setAnswerText] = React.useState('');
  const [simulationResults, setSimulationResults] = React.useState([]);
  const [isSubmittingRound, setIsSubmittingRound] = React.useState(false);

  const loadData = React.useCallback(() => {
    dispatch(fetchLessons());
    dispatch(fetchProgress());
  }, [dispatch]);

  React.useEffect(() => {
    if (!user) {
      navigation.replace('Login');
      return;
    }
    loadData();
  }, [loadData, navigation, user]);

  const trackLessons = items.filter((l) => l.trackId === selectedTrack);
  const trackLessonIds = new Set(trackLessons.map((l) => l.id));
  const trackProgress = progress.filter((p) => trackLessonIds.has(p.lessonId));

  const completedCount = trackLessons.filter((l) => l.completed).length;
  const avgScore = trackProgress.length
    ? Math.round(trackProgress.reduce((sum, p) => sum + (p.score || 0), 0) / trackProgress.length)
    : 0;
  const activeTrack = TRACKS.find((t) => t.id === selectedTrack) || TRACKS[0];

  const isInterviewTrack = selectedTrack === 'interview_mastery';
  const currentSimulationRound = simulationRounds[currentRound];
  const isSimulationComplete = simulationVisible && currentRound >= simulationRounds.length;

  React.useEffect(() => {
    if (!simulationVisible || isSimulationComplete) {
      return undefined;
    }

    if (timeLeft <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSimulationSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [simulationVisible, isSimulationComplete, timeLeft, currentRound]);

  const onOpenQuiz = (lesson) => {
    setActiveLesson(lesson);
    setSelectedOption('');
    setQuizResult(null);
  };

  const onSubmitQuiz = async () => {
    if (
      !activeLesson ||
      !activeLesson.quiz ||
      activeLesson.quiz.length === 0 ||
      !selectedOption ||
      quizResult ||
      isSubmittingQuiz
    ) {
      return;
    }

    setIsSubmittingQuiz(true);
    const firstQuestion = activeLesson.quiz[0];
    const isCorrect = firstQuestion.answer === selectedOption;
    const score = isCorrect ? 100 : 0;

    await dispatch(submitProgress(activeLesson.id, score));
    setQuizResult({ isCorrect, score, answer: firstQuestion.answer });
    setIsSubmittingQuiz(false);
  };

  const onCloseQuiz = () => {
    setActiveLesson(null);
    setSelectedOption('');
    setQuizResult(null);
    setIsSubmittingQuiz(false);
  };

  const startInterviewSimulation = () => {
    const rounds = buildInterviewRounds(trackLessons);
    setSimulationRounds(rounds);
    setCurrentRound(0);
    setTimeLeft(SIMULATION_DURATION_SECONDS);
    setAnswerText('');
    setSimulationResults([]);
    setSimulationVisible(true);
  };

  const closeInterviewSimulation = () => {
    setSimulationVisible(false);
    setSimulationRounds([]);
    setCurrentRound(0);
    setTimeLeft(SIMULATION_DURATION_SECONDS);
    setAnswerText('');
    setSimulationResults([]);
  };

  const handleSimulationSubmit = async (autoSubmit = false) => {
    if (!currentSimulationRound || isSubmittingRound) {
      return;
    }

    setIsSubmittingRound(true);

    const evaluation = evaluateStarResponse(answerText, currentSimulationRound.rubric, user?.role);
    const result = {
      roundId: currentSimulationRound.id,
      title: currentSimulationRound.title,
      prompt: currentSimulationRound.prompt,
      score: evaluation.score,
      breakdown: evaluation.breakdown,
      feedback: evaluation.feedback,
      suggestedAnswer: buildSuggestedStarAnswer(
        currentSimulationRound.prompt,
        evaluation.missingSections,
        user?.role,
      ),
      timedOut: autoSubmit,
    };

    await dispatch(submitProgress(currentSimulationRound.id, evaluation.score));
    setSimulationResults((prev) => [...prev, result]);
    setCurrentRound((prev) => prev + 1);
    setTimeLeft(SIMULATION_DURATION_SECONDS);
    setAnswerText('');
    setIsSubmittingRound(false);
  };

  const simulationAverage = simulationResults.length
    ? Math.round(simulationResults.reduce((sum, item) => sum + item.score, 0) / simulationResults.length)
    : 0;

  const starSummary = simulationResults.reduce(
    (acc, item) => {
      acc.situation += item.breakdown.situation;
      acc.task += item.breakdown.task;
      acc.action += item.breakdown.action;
      acc.result += item.breakdown.result;
      return acc;
    },
    { situation: 0, task: 0, action: 0, result: 0 },
  );

  const roundsCount = simulationResults.length || 1;

  const onLogout = async () => {
    await dispatch(logoutUser());
    navigation.replace('Login');
  };

  const renderItem = ({ item }) => (
    <View style={styles.lessonCard}>
      <View style={styles.lessonHeader}>
        <Text style={styles.lessonLanguage}>{item.language}</Text>
        <Text style={styles.lessonLevel}>{item.level}</Text>
      </View>
      <Text style={styles.lessonTitle}>{item.title}</Text>
      <Text style={styles.lessonContent}>{item.content}</Text>
      <View style={styles.footerRow}>
        <Text style={styles.statusText}>
          {item.completed ? `Completed • Score ${item.score ?? 0}%` : 'Not started'}
        </Text>
        <Pressable
          style={[styles.lessonButton, item.completed ? styles.reviewButton : styles.completeButton]}
          onPress={() => onOpenQuiz(item)}
        >
          <Text style={styles.lessonButtonText}>{item.completed ? 'Re-quiz' : 'Start Quiz'}</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back, {user?.username || 'Learner'}</Text>
          <Text style={styles.sub}>{activeTrack.subtitle}</Text>
        </View>
        <Pressable style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.trackSwitcher}>
        {TRACKS.map((track) => (
          <Pressable
            key={track.id}
            style={[
              styles.trackButton,
              selectedTrack === track.id ? styles.trackButtonActive : null,
            ]}
            onPress={() => setSelectedTrack(track.id)}
          >
            <Text
              style={[
                styles.trackButtonText,
                selectedTrack === track.id ? styles.trackButtonTextActive : null,
              ]}
            >
              {track.id === 'confidence_10min' ? '10-Min Confidence' : 'Interview Mastery'}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.featureCard}>
        <Text style={styles.featureTitle}>{activeTrack.title}</Text>
        <Text style={styles.featureSubtitle}>{activeTrack.subtitle}</Text>
        {isInterviewTrack ? (
          <Pressable style={styles.simulationButton} onPress={startInterviewSimulation}>
            <Text style={styles.simulationButtonText}>Start Timed Interview Simulation</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{completedCount}</Text>
          <Text style={styles.metricLabel}>Lessons Done</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{avgScore}%</Text>
          <Text style={styles.metricLabel}>Avg Score</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{trackLessons.length}</Text>
          <Text style={styles.metricLabel}>Total Lessons</Text>
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {isLoading && items.length === 0 ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#1f6feb" />
        </View>
      ) : (
        <FlatList
          data={trackLessons}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No lessons in this track yet.</Text>}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} />}
        />
      )}

      <Modal visible={Boolean(activeLesson)} animationType="slide" transparent onRequestClose={onCloseQuiz}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{activeLesson?.title}</Text>
            <Text style={styles.modalSubtitle}>Quick quiz</Text>

            {activeLesson?.quiz?.[0] ? (
              <>
                <Text style={styles.questionText}>{activeLesson.quiz[0].question}</Text>
                {activeLesson.quiz[0].options.map((option) => (
                  <Pressable
                    key={option}
                    style={[
                      styles.optionButton,
                      selectedOption === option ? styles.optionSelected : null,
                    ]}
                    onPress={() => setSelectedOption(option)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedOption === option ? styles.optionTextSelected : null,
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </>
            ) : (
              <Text style={styles.questionText}>No quiz available for this lesson yet.</Text>
            )}

            {quizResult ? (
              <Text style={[styles.resultText, quizResult.isCorrect ? styles.correct : styles.incorrect]}>
                {quizResult.isCorrect
                  ? `Correct! Score ${quizResult.score}%`
                  : `Not quite. Correct answer: ${quizResult.answer}`}
              </Text>
            ) : null}

            <View style={styles.modalFooter}>
              <Pressable style={styles.closeButton} onPress={onCloseQuiz}>
                <Text style={styles.closeButtonText}>{quizResult ? 'Done' : 'Close'}</Text>
              </Pressable>
              <Pressable
                style={[styles.submitButton, (!selectedOption || Boolean(quizResult) || isSubmittingQuiz) ? styles.disabledButton : null]}
                onPress={onSubmitQuiz}
                disabled={!selectedOption || !activeLesson?.quiz?.[0] || Boolean(quizResult) || isSubmittingQuiz}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={simulationVisible}
        animationType="slide"
        transparent
        onRequestClose={closeInterviewSimulation}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {!isSimulationComplete ? (
              <>
                <Text style={styles.modalTitle}>Interview Simulation</Text>
                <Text style={styles.modalSubtitle}>
                  Round {Math.min(currentRound + 1, simulationRounds.length)} of {simulationRounds.length}
                </Text>
                <Text style={styles.timer}>Time Left: {timeLeft}s</Text>
                <Text style={styles.questionText}>{currentSimulationRound?.prompt}</Text>
                <TextInput
                  style={styles.answerInput}
                  multiline
                  numberOfLines={5}
                  placeholder="Type your STAR answer here..."
                  value={answerText}
                  onChangeText={setAnswerText}
                />

                <View style={styles.modalFooter}>
                  <Pressable style={styles.closeButton} onPress={closeInterviewSimulation}>
                    <Text style={styles.closeButtonText}>Exit</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.submitButton, (!answerText.trim() || isSubmittingRound) ? styles.disabledButton : null]}
                    onPress={() => handleSimulationSubmit(false)}
                    disabled={!answerText.trim() || isSubmittingRound}
                  >
                    <Text style={styles.submitButtonText}>Submit Round</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <ScrollView
                style={styles.simulationScroll}
                contentContainerStyle={styles.simulationScrollContent}
                showsVerticalScrollIndicator
              >
                <Text style={styles.modalTitle}>Simulation Complete</Text>
                <Text style={styles.resultText}>Overall STAR Score: {simulationAverage}%</Text>
                <View style={styles.starGrid}>
                  <Text style={styles.starCell}>Situation: {Math.round(starSummary.situation / roundsCount)}%</Text>
                  <Text style={styles.starCell}>Task: {Math.round(starSummary.task / roundsCount)}%</Text>
                  <Text style={styles.starCell}>Action: {Math.round(starSummary.action / roundsCount)}%</Text>
                  <Text style={styles.starCell}>Result: {Math.round(starSummary.result / roundsCount)}%</Text>
                </View>
                <View style={styles.feedbackList}>
                  {simulationResults.map((item) => (
                    <View key={item.roundId} style={styles.feedbackCard}>
                      <Text style={styles.feedbackTitle}>{item.title}</Text>
                      <Text style={styles.feedbackMeta}>Round score: {item.score}%</Text>
                      <Text style={styles.feedbackText}>{item.feedback}</Text>
                      <Text style={styles.suggestionLabel}>Suggested improved answer</Text>
                      <Text style={styles.suggestionText}>{item.suggestedAnswer}</Text>
                    </View>
                  ))}
                </View>
                <Pressable style={styles.doneButton} onPress={closeInterviewSimulation}>
                  <Text style={styles.submitButtonText}>Done</Text>
                </Pressable>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fb',
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#102a43',
  },
  sub: {
    marginTop: 4,
    color: '#486581',
    fontSize: 13,
    width: 280,
  },
  trackSwitcher: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  trackButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#c7d2de',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 4,
  },
  trackButtonActive: {
    borderColor: '#1f6feb',
    backgroundColor: '#eaf2ff',
  },
  trackButtonText: {
    color: '#334e68',
    fontSize: 12,
    fontWeight: '700',
  },
  trackButtonTextActive: {
    color: '#1f4c9c',
  },
  featureCard: {
    backgroundColor: '#102a43',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  featureTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  featureSubtitle: {
    color: '#d8e8ff',
    marginTop: 5,
    lineHeight: 18,
  },
  simulationButton: {
    marginTop: 12,
    backgroundColor: '#2f855a',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  simulationButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  logoutButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c8d5e2',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  logoutText: {
    color: '#334e68',
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginHorizontal: 4,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dde7f0',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f6feb',
  },
  metricLabel: {
    marginTop: 3,
    fontSize: 12,
    color: '#5b738b',
  },
  error: {
    color: '#c53030',
    marginBottom: 8,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 18,
  },
  emptyText: {
    color: '#486581',
    textAlign: 'center',
    marginTop: 24,
    fontWeight: '600',
  },
  lessonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dbe6f1',
    padding: 14,
    marginBottom: 10,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  lessonLanguage: {
    color: '#1f6feb',
    fontWeight: '700',
    fontSize: 12,
  },
  lessonLevel: {
    color: '#627d98',
    fontWeight: '600',
    fontSize: 12,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#102a43',
  },
  lessonContent: {
    marginTop: 6,
    color: '#486581',
    fontSize: 14,
    lineHeight: 20,
  },
  footerRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    color: '#334e68',
    fontSize: 13,
    flex: 1,
  },
  lessonButton: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
  },
  completeButton: {
    backgroundColor: '#1f6feb',
  },
  reviewButton: {
    backgroundColor: '#2f855a',
  },
  lessonButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 26,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#102a43',
  },
  modalSubtitle: {
    marginTop: 2,
    marginBottom: 10,
    color: '#4b6077',
  },
  questionText: {
    fontSize: 16,
    color: '#243b53',
    fontWeight: '600',
    marginBottom: 10,
  },
  timer: {
    marginBottom: 8,
    color: '#b42318',
    fontWeight: '700',
  },
  answerInput: {
    borderWidth: 1,
    borderColor: '#d3deea',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 110,
    textAlignVertical: 'top',
    marginBottom: 10,
    color: '#243b53',
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#d3deea',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  optionSelected: {
    borderColor: '#1f6feb',
    backgroundColor: '#ebf3ff',
  },
  optionText: {
    color: '#334e68',
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#1f4c9c',
  },
  resultText: {
    marginTop: 8,
    marginBottom: 10,
    fontWeight: '700',
  },
  correct: {
    color: '#2f855a',
  },
  incorrect: {
    color: '#c53030',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  closeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#c7d2de',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  closeButtonText: {
    color: '#334e68',
    fontWeight: '700',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#1f6feb',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginLeft: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.5,
  },
  simulationScroll: {
    maxHeight: '78%',
  },
  simulationScrollContent: {
    paddingBottom: 8,
  },
  doneButton: {
    backgroundColor: '#1f6feb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  starGrid: {
    marginTop: 8,
    marginBottom: 14,
    backgroundColor: '#f0f7ff',
    borderRadius: 10,
    padding: 10,
  },
  starCell: {
    color: '#1e3a5f',
    fontWeight: '600',
    marginBottom: 4,
  },
  feedbackList: {
    maxHeight: 380,
    marginBottom: 12,
  },
  feedbackCard: {
    backgroundColor: '#f8fbff',
    borderWidth: 1,
    borderColor: '#d9e6f2',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  feedbackTitle: {
    color: '#12355b',
    fontWeight: '800',
    marginBottom: 2,
  },
  feedbackMeta: {
    color: '#1f4c7a',
    fontWeight: '700',
    marginBottom: 4,
    fontSize: 12,
  },
  feedbackText: {
    color: '#334e68',
    lineHeight: 18,
  },
  suggestionLabel: {
    marginTop: 8,
    marginBottom: 4,
    color: '#1f4c7a',
    fontWeight: '800',
    fontSize: 12,
  },
  suggestionText: {
    color: '#243b53',
    lineHeight: 18,
  },
});

export default HomeScreen;