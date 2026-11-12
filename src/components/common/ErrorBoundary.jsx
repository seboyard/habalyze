import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createPageUrl } from '@/utils';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // Aquí podrías enviar el error a un servicio de logging
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div 
          className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4"
          role="alert"
          aria-live="assertive"
        >
          <Card className="max-w-md w-full p-8 text-center shadow-xl border-2 border-red-100">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-500" aria-hidden="true" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              ¡Ups! Algo salió mal
            </h1>
            
            <p className="text-gray-600 mb-6">
              Ha ocurrido un error inesperado. No te preocupes, tu progreso está guardado.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                aria-label="Intentar de nuevo"
              >
                <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                Intentar de nuevo
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.location.href = createPageUrl('Dashboard')}
                aria-label="Ir al inicio"
              >
                <Home className="w-4 h-4 mr-2" aria-hidden="true" />
                Ir al inicio
              </Button>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  Detalles técnicos (desarrollo)
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded-lg text-xs overflow-auto max-h-40 text-red-600">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;