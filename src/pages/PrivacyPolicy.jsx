import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, Bell, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { createPageUrl } from '@/utils';

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: Database,
      title: 'Información que Recopilamos',
      content: [
        'Información de cuenta: nombre, email, y preferencias de usuario',
        'Datos de hábitos: tus hábitos, completaciones, rachas y progreso',
        'Datos de avatar: configuración de tu avatar personalizado',
        'Información de uso: cómo interactúas con la aplicación',
        'Datos sociales: amigos, comentarios y actividades que compartes'
      ]
    },
    {
      icon: Lock,
      title: 'Cómo Usamos tu Información',
      content: [
        'Proporcionar y mejorar nuestros servicios',
        'Personalizar tu experiencia en Habalyze',
        'Enviar notificaciones sobre tu progreso y actividades',
        'Analizar el uso de la aplicación para mejoras',
        'Facilitar interacciones sociales con otros usuarios',
        'Procesar pagos y suscripciones premium de forma segura'
      ]
    },
    {
      icon: Shield,
      title: 'Protección de tus Datos',
      content: [
        'Encriptación de datos en tránsito y en reposo',
        'Acceso restringido solo a personal autorizado',
        'Auditorías de seguridad regulares',
        'Cumplimiento con estándares de la industria',
        'Respaldos seguros y recuperación ante desastres',
        'Autenticación segura y protección de sesiones'
      ]
    },
    {
      icon: Eye,
      title: 'Compartir Información',
      content: [
        'No vendemos ni compartimos tus datos personales con terceros',
        'Datos sociales: lo que compartes voluntariamente es visible para amigos',
        'Proveedores de servicios: solo para operaciones necesarias (pagos, hosting)',
        'Cumplimiento legal: cuando sea requerido por ley',
        'Puedes controlar tu privacidad en la configuración de tu perfil'
      ]
    },
    {
      icon: UserCheck,
      title: 'Tus Derechos',
      content: [
        'Acceder a todos tus datos personales',
        'Corregir información incorrecta',
        'Eliminar tu cuenta y todos tus datos',
        'Exportar tus datos en formato legible',
        'Controlar qué información compartes públicamente',
        'Optar por no recibir comunicaciones de marketing'
      ]
    },
    {
      icon: Bell,
      title: 'Cookies y Seguimiento',
      content: [
        'Usamos cookies esenciales para el funcionamiento de la app',
        'Cookies de análisis para entender el uso de la aplicación',
        'Puedes gestionar las preferencias de cookies en tu navegador',
        'No usamos cookies de publicidad de terceros',
        'Almacenamiento local para mejorar el rendimiento'
      ]
    },
    {
      icon: Trash2,
      title: 'Eliminación de Datos',
      content: [
        'Puedes eliminar tu cuenta en cualquier momento desde Configuración',
        'Al eliminar tu cuenta, todos tus datos se eliminan permanentemente',
        'Conservamos datos mínimos solo si es legalmente requerido',
        'Periodo de retención de 30 días antes de eliminación definitiva',
        'Puedes solicitar eliminación inmediata contactando a soporte'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24">
        <Link to={createPageUrl('Settings')}>
          <button className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver a Configuración</span>
          </button>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Política de Privacidad
              </h1>
              <p className="text-sm text-gray-500">Última actualización: Diciembre 2024</p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-gray-600">
            <p className="text-base leading-relaxed">
              En Habalyze, valoramos tu privacidad y nos comprometemos a proteger tus datos personales. 
              Esta política describe cómo recopilamos, usamos y protegemos tu información cuando utilizas nuestra aplicación.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {sections.map((section, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                  <section.icon className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800 mb-3">{section.title}</h2>
                  <ul className="space-y-2">
                    {section.content.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600">
                        <span className="text-purple-500 mt-1.5">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Cambios en esta Política</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            Nos reservamos el derecho de actualizar esta política de privacidad en cualquier momento. 
            Te notificaremos sobre cambios importantes mediante un aviso en la aplicación o por email.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Al continuar usando Habalyze después de estos cambios, aceptas la política actualizada.
          </p>
        </Card>

        <Card className="p-6 mt-6 bg-white">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Contáctanos</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            Si tienes preguntas sobre esta política de privacidad o sobre cómo manejamos tus datos, 
            no dudes en contactarnos:
          </p>
          <div className="space-y-2 text-gray-600">
            <p><strong>Email:</strong> privacy@habalyze.com</p>
            <p><strong>Soporte:</strong> Desde la sección de Configuración en la app</p>
          </div>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2024 Habalyze. Todos los derechos reservados.</p>
          <p className="mt-1">Comprometidos con tu privacidad y el éxito de tus hábitos.</p>
        </div>
      </div>
    </div>
  );
}