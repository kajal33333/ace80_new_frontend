import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="text-center border-2 border-primary/20 shadow-lg">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <svg 
                className="w-12 h-12 text-primary" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33M15 19l3-3m0 0l-3-3m3 3H9" 
                />
              </svg>
            </div>
            <CardTitle className="text-3xl font-bold text-foreground mb-2">
              404
            </CardTitle>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Page Not Found
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Oops! It looks like this page has wandered off into the fields. 
              The page you're looking for doesn't exist or has been moved.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Decorative elements */}
            <div className="flex justify-center items-center gap-2 text-muted-foreground/60">
              <div className="w-2 h-2 bg-primary/30 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-secondary/30 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-accent/30 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Back to Home
                </Link>
              </Button>
              
              <Button variant="outline" asChild>
                <Link href="/admin/dashboard">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Go to Dashboard
                </Link>
              </Button>
            </div>
            
            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground/70">
                If you believe this is an error, please contact support
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Background decorative elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary/5 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}
