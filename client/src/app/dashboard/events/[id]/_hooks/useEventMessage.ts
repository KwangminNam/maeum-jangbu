import { useMemo } from "react";
import { Heart, Flower2, Cake, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

interface EventMessage {
  icon: ReactNode;
  message: string;
  subMessage?: string;
}

// 다음 기념일까지 남은 일수 계산 (매년 반복되는 이벤트용)
const getDaysUntilNextAnniversary = (eventDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const event = new Date(eventDate);
  const thisYearAnniversary = new Date(
    today.getFullYear(),
    event.getMonth(),
    event.getDate()
  );

  if (thisYearAnniversary < today) {
    thisYearAnniversary.setFullYear(today.getFullYear() + 1);
  }

  const diffTime = thisYearAnniversary.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// 이벤트로부터 경과한 년수 계산
const getYearsSinceEvent = (eventDate: string): number => {
  const today = new Date();
  const event = new Date(eventDate);
  let years = today.getFullYear() - event.getFullYear();

  const thisYearAnniversary = new Date(
    today.getFullYear(),
    event.getMonth(),
    event.getDate()
  );
  if (today < thisYearAnniversary) {
    years -= 1;
  }

  return Math.max(0, years);
};

// 이벤트 타입별 아이콘 컴포넌트
const getEventIcon = (type: string): ReactNode => {
  switch (type) {
    case "WEDDING":
      return Heart({ className: "text-pink-500", size: 20 });
    case "FUNERAL":
      return Flower2({ className: "text-purple-400", size: 20 });
    case "BIRTHDAY":
      return Cake({ className: "text-yellow-500", size: 20 });
    default:
      return Sparkles({ className: "text-amber-500", size: 20 });
  }
};

// 이벤트 타입별 특별 메시지 생성
const getEventMessage = (type: string, eventDate: string): EventMessage | null => {
  const daysUntil = getDaysUntilNextAnniversary(eventDate);
  const yearsSince = getYearsSinceEvent(eventDate);
  const icon = getEventIcon(type);

  switch (type) {
    case "WEDDING": {
      if (daysUntil === 0) {
        return {
          icon,
          message: "오늘은 결혼기념일이에요!",
          subMessage:
            yearsSince > 0
              ? `벌써 ${yearsSince}주년, 축하드려요!`
              : "첫 번째 결혼기념일을 축하해요!",
        };
      }
      if (daysUntil <= 30) {
        return {
          icon,
          message: `결혼기념일까지 D-${daysUntil}`,
          subMessage:
            yearsSince > 0
              ? `곧 ${yearsSince + 1}주년이 되네요!`
              : "곧 첫 번째 기념일이에요!",
        };
      }
      return {
        icon,
        message: "행복한 결혼 생활 되세요",
        subMessage:
          yearsSince > 0
            ? `${yearsSince}주년을 함께 해주셔서 감사해요`
            : undefined,
      };
    }

    case "FUNERAL": {
      if (daysUntil === 0) {
        return {
          icon,
          message: "오늘은 기일이에요",
          subMessage: "하늘에서 평안히 쉬고 계실 거예요",
        };
      }
      if (daysUntil <= 14) {
        return {
          icon,
          message: `기일까지 D-${daysUntil}`,
          subMessage: "소중한 분을 기억하며...",
        };
      }
      return {
        icon,
        message: "하늘에서 편히 쉬고 계실 거예요",
        subMessage: "마음 속에 늘 함께 해요",
      };
    }

    case "BIRTHDAY": {
      if (daysUntil === 0) {
        return {
          icon,
          message: "오늘이 바로 그 날이에요!",
          subMessage: "생일 축하드려요!",
        };
      }
      if (daysUntil <= 30) {
        return {
          icon,
          message: `생일까지 D-${daysUntil}`,
          subMessage: "특별한 하루가 될 거예요!",
        };
      }
      return {
        icon,
        message: "좋은 추억이 되셨길 바라요",
        subMessage: "함께해 주셔서 감사해요",
      };
    }

    default: {
      return {
        icon,
        message: "소중한 순간을 기록했어요",
        subMessage: "함께해 주신 분들께 감사드려요",
      };
    }
  }
};

export const useEventMessage = (type: string, eventDate: string) => {
  return useMemo(() => getEventMessage(type, eventDate), [type, eventDate]);
};
