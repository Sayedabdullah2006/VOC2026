import { Enrollment, Assessment } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StudentProgressProps {
  enrollment: Enrollment;
  assessments: Assessment[];
}

export default function StudentProgress({ enrollment, assessments }: StudentProgressProps) {
  const averageScore = assessments.length > 0
    ? assessments.reduce((sum, assessment) => sum + assessment.score, 0) / assessments.length
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2 text-sm">
              <span>Progress</span>
              <span>{enrollment.progress}%</span>
            </div>
            <Progress value={enrollment.progress} />
          </div>
          
          <div>
            <div className="flex justify-between mb-2 text-sm">
              <span>Average Assessment Score</span>
              <span>{averageScore.toFixed(1)}%</span>
            </div>
            <Progress value={averageScore} />
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Recent Assessments</h4>
            {assessments.length === 0 ? (
              <p className="text-sm text-gray-600">No assessments recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {assessments.map((assessment) => (
                  <div key={assessment.id} className="text-sm">
                    <div className="flex justify-between">
                      <span>{format(new Date(assessment.date), "MMM d, yyyy")}</span>
                      <span className="font-medium">{assessment.score}%</span>
                    </div>
                    {assessment.feedback && (
                      <p className="text-gray-600 mt-1">{assessment.feedback}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
