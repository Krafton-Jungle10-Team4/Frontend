import { ModelResult, TestSet } from '../types/testSet';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/card';
import { Cpu, User } from 'lucide-react';
import { ScoreBar } from './ScoreBar';

interface ModelResultCardProps {
  result: ModelResult;
  testSet: TestSet;
}

export function ModelResultCard({ result, testSet }: ModelResultCardProps) {
  const isWinner = testSet.winner.model === result.model;
  const isSelection = testSet.userSelection?.model === result.model;

  let badge = null;
  if (isWinner) {
    badge = (
      <span className="text-xs font-bold uppercase text-cyan-300 bg-cyan-500/20 px-2 py-1 rounded-full">
        🏆 Winner
      </span>
    );
  } else if (isSelection) {
    badge = (
      <span className="text-xs font-bold uppercase text-blue-300 bg-blue-500/20 px-2 py-1 rounded-full">
        👤 Selection
      </span>
    );
  }

  return (
    <Card className="bg-gray-900/50 border border-white/20 text-white h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            {isWinner ? <Cpu className="mr-2 h-5 w-5 text-cyan-400" /> : isSelection ? <User className="mr-2 h-5 w-5 text-blue-400" /> : null}
            <span className="text-lg">{result.model}</span>
          </div>
          {badge}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {result.responses.map((response) => (
          <div key={response.id} className="border-t border-white/10 pt-3">
            <p className="text-sm font-semibold text-gray-400">{response.question}</p>
            <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap break-words">{response.answer}</p>
            <div className="flex items-center mt-2">
              <p className="text-xs text-gray-400 mr-2">Score: {response.score}</p>
              <ScoreBar score={response.score} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
