import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useGuru } from '../../hooks/useGuru';
import { Sparkles } from 'lucide-react';

export function GuruSmartCard({ context }: { context: any }) {
  const guru = useGuru();
  
  return (
    <Card className="p-3 space-y-2 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="p-0">
        <CardTitle className="flex items-center space-x-2 text-sm">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span>Guru Suggestions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Button 
          size="sm" 
          onClick={()=>guru.mutate({ kind: 'deal', context })} 
          disabled={guru.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {guru.isPending ? 'Thinking…' : 'Ask Guru'}
        </Button>
        <div className="text-sm mt-3 space-y-2">
          {guru.data?.suggestions?.map((s: any, i: number) => (
            <div key={i} className="p-2 bg-white/60 rounded-lg text-gray-700 text-xs">
              • {s}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
