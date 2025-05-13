import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardShell from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { Course, Assessment } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<number | null>(null);

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const assessmentForm = useForm({
    defaultValues: {
      score: "",
      feedback: "",
    },
  });

  const createAssessmentMutation = useMutation({
    mutationFn: async (data: { score: number; feedback: string }) => {
      if (!selectedEnrollmentId) return;
      return apiRequest("POST", "/api/assessments", {
        enrollmentId: selectedEnrollmentId,
        score: parseInt(data.score),
        feedback: data.feedback,
        date: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
      assessmentForm.reset();
      setSelectedEnrollmentId(null);
    },
  });

  const myCourses = courses?.filter((course) => course.instructorId === user?.id);

  return (
    <DashboardShell>
      <div className="grid gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">My Courses</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {myCourses?.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <Button onClick={() => setSelectedEnrollmentId(1)} className="w-full">
                    Add Assessment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {selectedEnrollmentId && (
          <Card>
            <CardHeader>
              <CardTitle>Add Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...assessmentForm}>
                <form 
                  onSubmit={assessmentForm.handleSubmit((data) => 
                    createAssessmentMutation.mutate({ 
                      score: parseInt(data.score), 
                      feedback: data.feedback 
                    })
                  )} 
                  className="space-y-4"
                >
                  <FormField
                    control={assessmentForm.control}
                    name="score"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Score (%)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={assessmentForm.control}
                    name="feedback"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Feedback</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" disabled={createAssessmentMutation.isPending}>
                      Submit Assessment
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setSelectedEnrollmentId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
