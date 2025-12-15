import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DataCleanup() {
  const [isScanning, setIsScanning] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [issues, setIssues] = useState<any[]>([]);
  const [scanComplete, setScanComplete] = useState(false);

  const scanForIssues = async () => {
    setIsScanning(true);
    setScanComplete(false);
    setIssues([]);

    try {
      const { data: classes, error } = await supabase
        .from('classes')
        .select('*')
        .eq('subject', '');

      if (error) throw error;

      const foundIssues = classes?.map((cls: any) => ({
        id: cls.id,
        name: `${cls.grade} - Section ${cls.section}`,
        subject: cls.subject,
        hasEmptySubject: !cls.subject || cls.subject.trim() === ''
      })) || [];

      setIssues(foundIssues);
      setScanComplete(true);

      if (foundIssues.length === 0) {
        toast({
          title: "No Issues Found",
          description: "All classes have valid subject values",
        });
      } else {
        toast({
          title: "Issues Found",
          description: `Found ${foundIssues.length} class${foundIssues.length > 1 ? 'es' : ''} with empty subject`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error scanning for issues:', error);
      toast({
        title: "Scan Failed",
        description: "Failed to scan for data issues",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const fixIssues = async () => {
    if (issues.length === 0) return;

    setIsFixing(true);

    try {
      let fixedCount = 0;

      for (const issue of issues) {
        if (issue.hasEmptySubject) {
          const { error } = await supabase
            .from('classes')
            .update({ subject: 'General' })
            .eq('id', issue.id);

          if (error) {
            console.error(`Error fixing class ${issue.id}:`, error);
          } else {
            fixedCount++;
          }
        }
      }

      toast({
        title: "Data Cleaned",
        description: `Fixed ${fixedCount} class${fixedCount > 1 ? 'es' : ''}. Empty subjects set to 'General'.`,
      });

      // Rescan to show updated results
      await scanForIssues();
    } catch (error) {
      console.error('Error fixing issues:', error);
      toast({
        title: "Fix Failed",
        description: "Failed to fix some data issues",
        variant: "destructive",
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Cleanup Tool</CardTitle>
        <CardDescription>
          Scan for and fix classes with empty subject values
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={scanForIssues} 
            disabled={isScanning || isFixing}
            variant="outline"
          >
            {isScanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              'Scan for Issues'
            )}
          </Button>

          {scanComplete && issues.length > 0 && (
            <Button 
              onClick={fixIssues} 
              disabled={isFixing}
              variant="default"
            >
              {isFixing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fixing...
                </>
              ) : (
                'Fix All Issues'
              )}
            </Button>
          )}
        </div>

        {scanComplete && issues.length === 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>All Clear!</AlertTitle>
            <AlertDescription>
              No data issues found. All classes have valid subject values.
            </AlertDescription>
          </Alert>
        )}

        {issues.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Issues Found</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-2">
                {issues.map((issue) => (
                  <div key={issue.id} className="text-sm">
                    <strong>{issue.name}</strong>
                    {issue.hasEmptySubject && <span className="ml-2">• Empty subject</span>}
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
