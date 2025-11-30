import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';



const ProjectEditPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button onClick={() => navigate("/admin/dashboard")} variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Projekt bearbeiten nicht verfügbar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Die Projektbearbeitung ist mit dem Git-basierten CMS derzeit nicht verfügbar.
              Verwenden Sie das Projekt-Upload-Formular im Admin-Dashboard, um neue Projekte hinzuzufügen.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectEditPage;
