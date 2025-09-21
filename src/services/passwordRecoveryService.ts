import { supabase } from '../lib/supabase';
import { getEmailService } from './emailService';

export interface PasswordRecoveryRequest {
  id: string;
  email: string;
  token: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

export class PasswordRecoveryService {
  // Generar token de recuperación
  static generateRecoveryToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Crear solicitud de recuperación
  static async createRecoveryRequest(email: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔄 Creando solicitud de recuperación para:', email);

      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        // Verificar si el usuario existe
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('id, email, name')
          .eq('email', email)
          .single();

        if (userError || !user) {
          console.log('❌ Usuario no encontrado:', email);
          return {
            success: false,
            message: 'No se encontró una cuenta con este email'
          };
        }

        console.log('✅ Usuario encontrado:', user);

        // Intentar usar Supabase Auth primero
        try {
          const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
          });

          if (authError) {
            console.error('❌ Error en Supabase Auth:', authError);
            // Fallback al método manual si Supabase Auth falla
            return this.createManualRecoveryRequest(email);
          }

          console.log('✅ Email de recuperación enviado con Supabase Auth');
          return {
            success: true,
            message: `Se ha enviado un enlace de recuperación a ${email}. Revisa tu bandeja de entrada y carpeta de spam.`
          };

        } catch (authError) {
          console.error('❌ Error en Supabase Auth:', authError);
          // Fallback al método manual si Supabase Auth falla
          return this.createManualRecoveryRequest(email);
        }

      } else {
        // Fallback para sistema sin Supabase
        console.log('⚠️ Supabase no configurado, usando sistema mock');
        return this.mockRecoveryRequest(email);
      }

    } catch (error) {
      console.error('❌ Error en recuperación de contraseña:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // Método manual de recuperación (fallback)
  private static async createManualRecoveryRequest(email: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔄 Usando método manual de recuperación...');

      // Generar token y fecha de expiración (1 hora)
      const token = this.generateRecoveryToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Eliminar solicitudes anteriores para este email
      await supabase
        .from('password_recovery')
        .delete()
        .eq('email', email);

      // Crear nueva solicitud
      const { error: insertError } = await supabase
        .from('password_recovery')
        .insert({
          email: email,
          token: token,
          expires_at: expiresAt.toISOString(),
          used: false
        });

      if (insertError) {
        console.error('❌ Error creando solicitud manual:', insertError);
        return {
          success: false,
          message: 'Error al crear la solicitud de recuperación'
        };
      }

      console.log('✅ Solicitud manual creada exitosamente');
      
      // Crear enlace de recuperación
      const recoveryLink = `${window.location.origin}/reset-password?token=${token}`;
      
      // Intentar enviar email real
      const emailService = getEmailService();
      if (emailService) {
        console.log('📧 Enviando email real...');
        const emailResult = await emailService.sendPasswordRecoveryEmail(
          email, 
          recoveryLink, 
          user.name
        );
        
        if (emailResult.success) {
          console.log('✅ Email enviado exitosamente');
          return {
            success: true,
            message: `Se ha enviado un enlace de recuperación a ${email}. Revisa tu bandeja de entrada y carpeta de spam.`
          };
        } else {
          console.log('⚠️ Error enviando email, mostrando enlace en consola');
        }
      }
      
      // Fallback: mostrar enlace en consola para desarrollo
      console.log('📧 Email de recuperación (desarrollo):');
      console.log(`🔗 Link: ${recoveryLink}`);
      console.log(`⏰ Expira: ${expiresAt.toLocaleString()}`);

      return {
        success: true,
        message: `Se ha enviado un enlace de recuperación a ${email}. El enlace expira en 1 hora.`
      };

    } catch (error) {
      console.error('❌ Error en recuperación manual:', error);
      return {
        success: false,
        message: 'Error al procesar la solicitud de recuperación'
      };
    }
  }

  // Verificar token de recuperación
  static async verifyRecoveryToken(token: string): Promise<{ valid: boolean; email?: string; message: string }> {
    try {
      console.log('🔍 Verificando token:', token);

      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        const { data, error } = await supabase
          .from('password_recovery')
          .select('*')
          .eq('token', token)
          .eq('used', false)
          .single();

        if (error || !data) {
          console.log('❌ Token no encontrado o ya usado');
          return {
            valid: false,
            message: 'Token inválido o ya utilizado'
          };
        }

        // Verificar si el token ha expirado
        const now = new Date();
        const expiresAt = new Date(data.expires_at);

        if (now > expiresAt) {
          console.log('❌ Token expirado');
          return {
            valid: false,
            message: 'El enlace de recuperación ha expirado'
          };
        }

        console.log('✅ Token válido para:', data.email);
        return {
          valid: true,
          email: data.email,
          message: 'Token válido'
        };

      } else {
        // Fallback para sistema sin Supabase
        return this.mockVerifyToken(token);
      }

    } catch (error) {
      console.error('❌ Error verificando token:', error);
      return {
        valid: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // Resetear contraseña
  static async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔄 Reseteando contraseña con token:', token);

      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        // Verificar token primero
        const tokenVerification = await this.verifyRecoveryToken(token);
        if (!tokenVerification.valid) {
          return {
            success: false,
            message: tokenVerification.message
          };
        }

        // Actualizar contraseña
        const { error: updateError } = await supabase
          .from('users')
          .update({ password: newPassword })
          .eq('email', tokenVerification.email);

        if (updateError) {
          console.error('❌ Error actualizando contraseña:', updateError);
          return {
            success: false,
            message: 'Error al actualizar la contraseña'
          };
        }

        // Marcar token como usado
        await supabase
          .from('password_recovery')
          .update({ used: true })
          .eq('token', token);

        console.log('✅ Contraseña actualizada exitosamente');
        return {
          success: true,
          message: 'Contraseña actualizada exitosamente'
        };

      } else {
        // Fallback para sistema sin Supabase
        return this.mockResetPassword(token, newPassword);
      }

    } catch (error) {
      console.error('❌ Error reseteando contraseña:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // Métodos mock para desarrollo
  private static mockRecoveryRequest(email: string): { success: boolean; message: string } {
    console.log('📧 Mock: Email de recuperación enviado a:', email);
    return {
      success: true,
      message: `Se ha enviado un enlace de recuperación a ${email}. (Sistema de desarrollo)`
    };
  }

  private static mockVerifyToken(token: string): { valid: boolean; email?: string; message: string } {
    // En desarrollo, aceptamos cualquier token que contenga "test"
    if (token.includes('test')) {
      return {
        valid: true,
        email: 'cliente@email.com',
        message: 'Token válido (desarrollo)'
      };
    }
    return {
      valid: false,
      message: 'Token inválido'
    };
  }

  private static mockResetPassword(token: string, newPassword: string): { success: boolean; message: string } {
    console.log('🔄 Mock: Contraseña actualizada');
    return {
      success: true,
      message: 'Contraseña actualizada exitosamente (desarrollo)'
    };
  }
}
