'use client';

import type { BuiltinInterventionProps } from '@lobechat/types';
import { Button, Flexbox, Icon, Input, Markdown, Text } from '@lobehub/ui';
import { cx } from 'antd-style';
import { ChevronLeft, ChevronRight, PenLine, SendHorizontal } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';

import type {
  AskUserQuestionArgs,
  ClarifyAnswer,
  ClarifyQuestion,
  ClarifySubmitPayload,
} from '../../../types';
import { styles } from './style';

type DraftAnswer = Omit<ClarifyAnswer, 'question'>;

const getInitialAnswers = (questions: ClarifyQuestion[]): Record<string, DraftAnswer> =>
  Object.fromEntries(
    questions.map((question) => [
      question.id,
      {
        selected: [],
      },
    ]),
  );

const getSelectedOption = (question: ClarifyQuestion, answer?: DraftAnswer) => {
  const selectedLabel = answer?.selected[0];
  if (!selectedLabel || question.multiSelect) return;

  return question.options.find((option) => option.label === selectedLabel);
};

const isAnswered = (answer?: DraftAnswer) =>
  !!answer && (answer.selected.length > 0 || !!answer.other?.trim());

const getOptionLetter = (index: number) => String.fromCharCode(65 + index);

const QuestionBlock = memo<{
  answer: DraftAnswer;
  onChange: (questionId: string, answer: DraftAnswer) => void;
  question: ClarifyQuestion;
}>(({ question, answer, onChange }) => {
  const selectedOption = getSelectedOption(question, answer);
  const preview = selectedOption?.preview;

  const handleToggleOption = useCallback(
    (label: string) => {
      const selected = question.multiSelect
        ? answer.selected.includes(label)
          ? answer.selected.filter((item) => item !== label)
          : [...answer.selected, label]
        : [label];

      onChange(question.id, {
        ...answer,
        // Single-select: picking an option means "Other" no longer applies — clear it
        // so we don't submit both `selected` and `other` as two parallel answers.
        // Multi-select keeps `other` as an additive custom entry alongside selections.
        other: question.multiSelect ? answer.other : undefined,
        selected,
        selectedPreview: question.multiSelect
          ? undefined
          : question.options.find((option) => option.label === label)?.preview,
      });
    },
    [answer, onChange, question],
  );

  const handleOtherChange = useCallback(
    (value: string) => {
      // Mirror of the rule in handleToggleOption: in single-select, typing in
      // Other replaces the selection. Multi-select keeps both.
      const next: DraftAnswer = {
        ...answer,
        other: value,
      };
      if (!question.multiSelect && value.trim()) {
        next.selected = [];
        next.selectedPreview = undefined;
      }
      onChange(question.id, next);
    },
    [answer, onChange, question.id, question.multiSelect],
  );

  return (
    <Flexbox gap={4}>
      <Text className={styles.questionText}>{question.question}</Text>

      <Flexbox gap={2}>
        {question.options.map((option, index) => {
          const selected = answer.selected.includes(option.label);
          const letter = getOptionLetter(index);

          return (
            <Flexbox
              horizontal
              align={'flex-start'}
              aria-checked={selected}
              className={cx(styles.option, selected && styles.optionSelected)}
              gap={10}
              key={option.label}
              role={question.multiSelect ? 'checkbox' : 'radio'}
              onClick={() => handleToggleOption(option.label)}
            >
              <span className={cx(styles.letter, selected && styles.letterSelected)}>{letter}</span>
              <Flexbox flex={1} gap={0}>
                <Text className={styles.optionLabel}>{option.label}</Text>
                <Text className={styles.description}>{option.description}</Text>
              </Flexbox>
            </Flexbox>
          );
        })}
      </Flexbox>

      <Flexbox horizontal align={'center'} className={styles.otherRow} gap={10}>
        <span className={styles.letter}>
          <Icon icon={PenLine} size={12} />
        </span>
        <Text className={styles.otherLabel}>Other</Text>
        <Input
          className={styles.otherInput}
          placeholder={'Type another answer'}
          size={'small'}
          value={answer.other ?? ''}
          variant={'filled'}
          onChange={(event) => handleOtherChange(event.target.value)}
        />
      </Flexbox>

      {preview && (
        <Flexbox gap={6} style={{ marginBlockStart: 4 }}>
          <Text style={{ fontSize: 12 }} type={'secondary'}>
            Preview
          </Text>
          <Flexbox className={styles.preview}>
            <Markdown fontSize={13} style={{ overflow: 'unset' }} variant={'chat'}>
              {preview}
            </Markdown>
          </Flexbox>
          <Input
            placeholder={'Optional notes for this choice'}
            size={'small'}
            value={answer.notes ?? ''}
            variant={'filled'}
            onChange={(event) =>
              onChange(question.id, {
                ...answer,
                notes: event.target.value,
              })
            }
          />
        </Flexbox>
      )}
    </Flexbox>
  );
});

QuestionBlock.displayName = 'ClarifyQuestionBlock';

const Stepper = memo<{
  currentIndex: number;
  onJump: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
  total: number;
}>(({ currentIndex, total, onPrev, onNext, onJump }) => (
  <Flexbox horizontal align={'center'} className={styles.stepper} gap={8}>
    <span
      className={cx(styles.navArrow, currentIndex === 0 && styles.navArrowDisabled)}
      onClick={onPrev}
    >
      <Icon icon={ChevronLeft} size={14} />
    </span>
    <Flexbox horizontal gap={4}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          style={{ cursor: 'pointer' }}
          className={cx(
            styles.dot,
            i === currentIndex && styles.dotActive,
            i < currentIndex && styles.dotDone,
          )}
          onClick={() => onJump(i)}
        />
      ))}
    </Flexbox>
    <Text className={styles.stepCount}>
      {currentIndex + 1} / {total}
    </Text>
    <span
      className={cx(styles.navArrow, currentIndex === total - 1 && styles.navArrowDisabled)}
      style={{ marginInlineStart: 'auto' }}
      onClick={onNext}
    >
      <Icon icon={ChevronRight} size={14} />
    </span>
  </Flexbox>
));

Stepper.displayName = 'ClarifyStepper';

const AskUserQuestionIntervention = memo<BuiltinInterventionProps<AskUserQuestionArgs>>(
  ({ args, interactionMode, onInteractionAction }) => {
    const questions = args.questions ?? [];
    const isCustom = interactionMode === 'custom';
    const [answers, setAnswers] = useState<Record<string, DraftAnswer>>(() =>
      getInitialAnswers(questions),
    );
    const [submitting, setSubmitting] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleAnswerChange = useCallback((questionId: string, answer: DraftAnswer) => {
      setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    }, []);

    const allAnswered = useMemo(
      () => questions.length > 0 && questions.every((question) => isAnswered(answers[question.id])),
      [answers, questions],
    );

    const isLast = currentIndex === questions.length - 1;
    const showStepper = questions.length > 1;

    const handleSubmit = useCallback(async () => {
      if (!onInteractionAction || !allAnswered) return;

      const payload: ClarifySubmitPayload = {
        answers: Object.fromEntries(
          questions.map((question) => {
            const answer = answers[question.id] ?? { selected: [] };
            return [
              question.id,
              {
                ...answer,
                notes: answer.notes?.trim() || undefined,
                other: answer.other?.trim() || undefined,
                question: question.question,
              },
            ];
          }),
        ),
      };

      setSubmitting(true);
      try {
        await onInteractionAction({
          payload: payload as unknown as Record<string, unknown>,
          type: 'submit',
        });
      } finally {
        setSubmitting(false);
      }
    }, [allAnswered, answers, onInteractionAction, questions]);

    const handleSkip = useCallback(async () => {
      if (!onInteractionAction) return;
      await onInteractionAction({ type: 'skip' });
    }, [onInteractionAction]);

    const handleNext = useCallback(() => {
      setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
    }, [questions.length]);

    const handlePrev = useCallback(() => {
      setCurrentIndex((i) => Math.max(i - 1, 0));
    }, []);

    const handleJump = useCallback((index: number) => {
      setCurrentIndex(index);
    }, []);

    if (!isCustom) {
      return (
        <Flexbox gap={8}>
          {questions.map((question) => (
            <Flexbox gap={4} key={question.id}>
              <Text>{question.question}</Text>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {question.options.map((option) => (
                  <li key={option.label}>{option.label}</li>
                ))}
              </ul>
            </Flexbox>
          ))}
        </Flexbox>
      );
    }

    const currentQuestion = questions[currentIndex];

    return (
      <Flexbox gap={12}>
        <Flexbox className={cx(submitting && styles.disabled)} gap={8}>
          {showStepper && (
            <Stepper
              currentIndex={currentIndex}
              total={questions.length}
              onJump={handleJump}
              onNext={handleNext}
              onPrev={handlePrev}
            />
          )}
          {currentQuestion && (
            <QuestionBlock
              answer={answers[currentQuestion.id] ?? { selected: [] }}
              question={currentQuestion}
              onChange={handleAnswerChange}
            />
          )}
        </Flexbox>
        <Flexbox horizontal align={'center'} justify={'space-between'}>
          <Text className={styles.actionLink} type={'secondary'} onClick={handleSkip}>
            {showStepper ? 'Skip All' : 'Skip'}
          </Text>
          {showStepper && !isLast ? (
            <Button
              icon={ChevronRight}
              iconPosition={'end'}
              size={'small'}
              type={'primary'}
              onClick={handleNext}
            >
              Next
            </Button>
          ) : (
            <Button
              disabled={!allAnswered}
              icon={SendHorizontal}
              loading={submitting}
              size={'small'}
              type={'primary'}
              onClick={handleSubmit}
            >
              Send
            </Button>
          )}
        </Flexbox>
      </Flexbox>
    );
  },
);

AskUserQuestionIntervention.displayName = 'ClarifyAskUserQuestionIntervention';

export default AskUserQuestionIntervention;
