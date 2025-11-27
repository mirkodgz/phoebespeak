import React, {useCallback, useContext, useEffect, useState, useRef} from 'react';
import Storage from '@react-native-async-storage/async-storage';

import {
  IUser,
  IUseData,
  ITheme,
  IDashboardData,
  IPracticeSessionData,
  IProgressOverviewData,
  IUserPreferences,
} from '../constants/types';

import {
  USERS,
  DASHBOARD_DATA,
  PRACTICE_SESSION_DATA,
  PROGRESS_OVERVIEW_DATA,
  USER_PREFERENCES,
} from '../constants/mocks';
import {
  fetchDashboard,
  fetchPracticeSession,
  fetchProgressOverview,
  fetchPreferences,
  updatePreferencesService,
} from '../services';
import {light} from '../constants';
import {
  ensureProfile,
  fetchProfileById,
  getCurrentAuthUser,
  signInWithEmail,
  signOutFromSupabase,
  signUpWithEmail,
  startTrialForUser,
  resetPassword,
  updatePassword as updatePasswordInSupabase,
} from '../services/supabaseAuth';
import {supabase} from '../lib/supabaseClient';

export const DataContext = React.createContext({});

const DEFAULT_USER: IUser = {
  ...USERS[0],
  name: '', // No usar nombre por defecto, siempre cargar desde el perfil
};

export const DataProvider = ({children}: {children: React.ReactNode}) => {
  const [isDark, setIsDark] = useState(false);
  const [theme, setTheme] = useState<ITheme>(light);
  // Inicializar el usuario sin nombre para que siempre se cargue desde el perfil
  const [user, setUserState] = useState<IUser>({
    ...DEFAULT_USER,
    name: '', // Siempre cargar desde el perfil sincronizado
  });
  const [dashboard, setDashboard] = useState<IDashboardData>(DASHBOARD_DATA);
  const [practice, setPractice] = useState<IPracticeSessionData>(
    PRACTICE_SESSION_DATA,
  );
  const [progress, setProgress] = useState<IProgressOverviewData>(
    PROGRESS_OVERVIEW_DATA,
  );
  const [preferences, setPreferences] = useState<IUserPreferences>(
    USER_PREFERENCES,
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [hasActiveTrial, setHasActiveTrial] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const isSyncingProfileRef = useRef(false);
  const completeOnboarding = useCallback(() => setHasOnboarded(true), []);

  const setUser = useCallback(
    (payload: Partial<IUser>) => {
      setUserState(prev => ({...prev, ...payload}));
    },
    [],
  );

  const updatePreferences = useCallback(
    async (payload: Partial<IUserPreferences>) => {
      const updated = await updatePreferencesService(payload);
      setPreferences(updated);
    },
    [],
  );

  // get isDark mode from storage
  const getIsDark = useCallback(async () => {
    const isDarkJSON = await Storage.getItem('isDark');

    if (isDarkJSON !== null) {
      setIsDark(JSON.parse(isDarkJSON));
    }
  }, [setIsDark]);

  const handleIsDark = useCallback(
    (payload: boolean) => {
      setIsDark(payload);
      Storage.setItem('isDark', JSON.stringify(payload));
    },
    [setIsDark],
  );

  useEffect(() => {
    getIsDark();
  }, [getIsDark]);

  useEffect(() => {
    setTheme(light);
  }, [isDark]);

  useEffect(() => {
    const loadData = async () => {
      const [dashboardData, practiceData, progressData, preferenceData] =
        await Promise.all([
          fetchDashboard(),
          fetchPracticeSession(),
          fetchProgressOverview(),
          fetchPreferences(),
        ]);
      setDashboard(dashboardData);
      setPractice(practiceData);
      setProgress(progressData);
      setPreferences(preferenceData);
    };

    loadData();
  }, []);

  const syncProfile = useCallback(
    async (authUser: {id: string; email?: string | null; user_metadata?: Record<string, unknown>}) => {
      if (!supabase) {
        return;
      }

      setIsProfileLoading(true);
      isSyncingProfileRef.current = true;
      try {
        // Obtener el nombre de los metadatos de Google
        // Google puede enviar el nombre en diferentes campos
        const googleName = 
          (authUser.user_metadata?.full_name as string | undefined) ||
          (authUser.user_metadata?.name as string | undefined) ||
          (authUser.user_metadata?.display_name as string | undefined) ||
          (authUser.user_metadata?.given_name as string | undefined) ||
          authUser.email?.split('@')[0] ||
          DEFAULT_USER.name ||
          'Alumno';

        console.log('[syncProfile] Sincronizando perfil para usuario:', {
          id: authUser.id,
          email: authUser.email,
          googleName,
          user_metadata: authUser.user_metadata,
        });

        // Verificar si el usuario se autenticó con Google
        const isGoogleAuth = 
          authUser.user_metadata?.provider === 'google' ||
          authUser.user_metadata?.iss === 'https://accounts.google.com' ||
          (authUser.user_metadata?.full_name && authUser.user_metadata?.name);

        console.log('[syncProfile] Verificación de Google Auth:', {
          isGoogleAuth,
          provider: authUser.user_metadata?.provider,
          iss: authUser.user_metadata?.iss,
          hasFullName: !!authUser.user_metadata?.full_name,
          hasName: !!authUser.user_metadata?.name,
        });

        // Obtener el perfil actual
        let profile = await fetchProfileById(authUser.id);
        
        console.log('[syncProfile] Perfil actual:', {
          exists: !!profile,
          full_name: profile?.full_name,
        });

        // Si el usuario se autenticó con Google y tenemos un nombre de Google válido
        if (isGoogleAuth && googleName && googleName !== 'Alumno') {
          console.log('[syncProfile] Es Google Auth, procesando actualización...');
          
          // Si el perfil existe pero el nombre es diferente al de Google, actualizarlo
          if (profile && profile.full_name !== googleName) {
            console.log('[syncProfile] Actualizando perfil con nombre de Google:', {
              nombreActual: profile.full_name,
              nombreGoogle: googleName,
            });
            const {error: updateError} = await supabase
              .from('profiles')
              .update({full_name: googleName})
              .eq('id', authUser.id);
            
            if (updateError) {
              console.error('[syncProfile] Error actualizando perfil:', updateError);
            } else {
              console.log('[syncProfile] Perfil actualizado exitosamente');
            }
            
            // Recargar el perfil actualizado
            profile = await fetchProfileById(authUser.id);
            console.log('[syncProfile] Perfil recargado:', {
              full_name: profile?.full_name,
            });
          } else if (!profile) {
            // Si no existe el perfil, crearlo con el nombre de Google
            console.log('[syncProfile] Creando nuevo perfil con nombre de Google:', googleName);
            profile = await ensureProfile(authUser.id, {
              id: authUser.id,
              full_name: googleName,
            });
            console.log('[syncProfile] Perfil creado:', {
              full_name: profile?.full_name,
            });
          } else {
            console.log('[syncProfile] Perfil ya tiene el nombre correcto, no se actualiza');
          }
        } else if (!profile) {
          // Si no es Google Auth y no existe el perfil, crearlo con el nombre disponible
          console.log('[syncProfile] No es Google Auth, creando perfil con nombre disponible');
          profile = await ensureProfile(authUser.id, {
            id: authUser.id,
            full_name: googleName,
          });
        }

        // Cargar avatar desde AsyncStorage si existe (respaldo si la columna no existe en Supabase)
        let avatarFromStorage: string | null = null;
        try {
          const storedAvatar = await Storage.getItem(`user_avatar_${authUser.id}`);
          if (storedAvatar) {
            avatarFromStorage = storedAvatar;
            console.log('[syncProfile] Avatar cargado desde AsyncStorage:', storedAvatar);
          }
        } catch (error) {
          console.warn('[syncProfile] Error cargando avatar desde storage:', error);
        }

        // Si es Google Auth, SIEMPRE usar el nombre de Google (ignorar el nombre del perfil)
        // Si no es Google Auth, usar el nombre del perfil o el nombre disponible
        let finalName: string;
        if (isGoogleAuth && googleName && googleName !== 'Alumno') {
          // Forzar el uso del nombre de Google
          finalName = googleName;
          console.log('[syncProfile] Usando nombre de Google (ignorando perfil):', finalName);
        } else {
          // Usar el nombre del perfil o el nombre disponible
          finalName = profile?.full_name ?? googleName;
          console.log('[syncProfile] Usando nombre del perfil:', finalName);
        }
        
        // Determinar el avatar: primero desde el perfil, luego desde storage, luego desde Google
        let finalAvatar: string | undefined = undefined;
        if (profile?.avatar_url) {
          finalAvatar = profile.avatar_url;
          console.log('[syncProfile] Avatar desde perfil:', finalAvatar);
        } else if (avatarFromStorage) {
          finalAvatar = avatarFromStorage;
          console.log('[syncProfile] Avatar desde AsyncStorage:', finalAvatar);
        } else if (authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture) {
          finalAvatar = (authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture) as string;
          console.log('[syncProfile] Avatar desde Google:', finalAvatar);
        }
        
        console.log('[syncProfile] Resumen final:', {
          finalName,
          finalAvatar,
          isGoogleAuth,
          profileName: profile?.full_name,
          googleName,
          decision: isGoogleAuth && googleName && googleName !== 'Alumno' ? 'Google' : 'Perfil',
        });

        console.log('[syncProfile] Actualizando estado del usuario con nombre:', finalName);
        
        // Solo actualizar el estado si tenemos un nombre válido
        if (finalName && finalName !== 'Alumno' && finalName.trim() !== '') {
          setUserState(prev => {
            const newState = {
              ...prev,
              id: authUser.id,
              name: finalName,
              avatar: finalAvatar,
              department: profile?.level ?? prev.department,
            };
            console.log('[syncProfile] Nuevo estado del usuario:', newState);
            return newState;
          });
        } else {
          console.log('[syncProfile] Nombre no válido, no actualizando estado:', finalName);
        }

        setHasActiveTrial(Boolean(profile?.has_premium));
        
        console.log('[syncProfile] Sincronización completada');
      } catch (error) {
        console.error('[syncProfile] Error sincronizando perfil:', error);
        throw error;
      } finally {
        // Esperar un momento antes de desactivar el loading para asegurar que el estado se propague
        // y el componente se re-renderice con el nombre correcto
        setTimeout(() => {
          setIsProfileLoading(false);
          isSyncingProfileRef.current = false;
          console.log('[syncProfile] Loading desactivado, estado propagado');
        }, 200);
      }
    },
    [],
  );

  const refreshProfile = useCallback(async () => {
    const authUser = await getCurrentAuthUser();
    if (authUser) {
      await syncProfile(authUser);
      setIsAuthenticated(true);
    }
  }, [syncProfile]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(async ({data}) => {
      if (!mounted) {
        return;
      }

      const authUser = data.session?.user;
      if (authUser) {
        setIsAuthenticated(true);
        await syncProfile(authUser);
      } else {
        setIsAuthenticated(false);
        setHasActiveTrial(false);
        setUserState(DEFAULT_USER);
      }
    });

    const {data: subscription} = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) {
          return;
        }

        // Si ya estamos sincronizando el perfil (por ejemplo, desde signInWithGoogle),
        // no sincronizar de nuevo desde onAuthStateChange para evitar condiciones de carrera
        if (isSyncingProfileRef.current) {
          console.log('[onAuthStateChange] Sincronización ya en curso, omitiendo...');
          return;
        }

        if (session?.user) {
          console.log('[onAuthStateChange] Usuario autenticado, sincronizando perfil...', event);
          setIsAuthenticated(true);
          await syncProfile(session.user);
        } else {
          console.log('[onAuthStateChange] Usuario no autenticado, limpiando estado...', event);
          setIsAuthenticated(false);
          setHasActiveTrial(false);
          setUserState(DEFAULT_USER);
        }
      },
    );

    return () => {
      mounted = false;
      subscription?.subscription.unsubscribe();
    };
  }, [syncProfile]);

  const signIn = useCallback(
    async ({email, password}: {email: string; password: string}) => {
      const authUser = await signInWithEmail({email, password});
      setIsAuthenticated(true);
      await syncProfile(authUser);
    },
    [syncProfile],
  );

  const signInWithGoogle = useCallback(async () => {
    console.log('[signInWithGoogle] Iniciando autenticación con Google...');
    
    // Marcar que estamos sincronizando para evitar que onAuthStateChange interfiera
    isSyncingProfileRef.current = true;
    
    try {
      const {signInWithGoogle: signInGoogle} = await import('../services/supabaseAuth');
      const authUser = await signInGoogle();
      console.log('[signInWithGoogle] Usuario autenticado:', {
        id: authUser.id,
        email: authUser.email,
        user_metadata: authUser.user_metadata,
      });
      
      setIsAuthenticated(true);
      
      // Esperar un momento para que Supabase procese completamente los metadatos de Google
      console.log('[signInWithGoogle] Esperando 500ms para que Supabase procese metadatos...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Obtener el usuario actualizado con todos los metadatos
      if (supabase) {
        const {data: {user: updatedUser}, error: getUserError} = await supabase.auth.getUser();
        if (getUserError) {
          console.error('[signInWithGoogle] Error obteniendo usuario actualizado:', getUserError);
        }
        if (updatedUser) {
          console.log('[signInWithGoogle] Usuario actualizado obtenido, sincronizando perfil...');
          await syncProfile(updatedUser);
        } else {
          console.log('[signInWithGoogle] Usando usuario original, sincronizando perfil...');
          await syncProfile(authUser);
        }
      } else {
        console.log('[signInWithGoogle] Supabase no disponible, usando usuario original...');
        await syncProfile(authUser);
      }
      
      console.log('[signInWithGoogle] Autenticación con Google completada');
    } finally {
      // Esperar un momento antes de desmarcar para asegurar que el estado se propague
      setTimeout(() => {
        isSyncingProfileRef.current = false;
        console.log('[signInWithGoogle] Bandera de sincronización desactivada');
      }, 500);
    }
  }, [syncProfile]);

  const signUp = useCallback(
    async ({
      email,
      password,
      fullName,
    }: {
      email: string;
      password: string;
      fullName: string;
    }) => {
      const {
        user: authUser,
        requiresEmailConfirmation,
      } = await signUpWithEmail({email, password, fullName});

      if (requiresEmailConfirmation) {
        // Si requiere confirmación de email, NO intentar crear el perfil ahora
        // El perfil se creará automáticamente cuando el usuario confirme el email
        // (a través del trigger de Supabase o cuando haga login después de confirmar)
        console.log('[signUp] Se requiere confirmación de email. El perfil se creará cuando el usuario confirme su correo.');
        setIsAuthenticated(false);
        setHasActiveTrial(false);
        setUserState(DEFAULT_USER);
        return 'confirmation_required';
      }

      // Si no requiere confirmación, crear el perfil inmediatamente
      setIsAuthenticated(true);
      await syncProfile(authUser);
      return 'signed_in';
    },
    [syncProfile],
  );

  const signOut = useCallback(async () => {
    // Actualizar el estado local inmediatamente para mejor UX
    // No esperamos a Supabase para limpiar el estado local
    setIsAuthenticated(false);
    setHasActiveTrial(false);
    setUserState(DEFAULT_USER);
    
    // Intentar cerrar sesión en Supabase en segundo plano
    // Si falla, no importa porque ya limpiamos el estado local
    try {
      await signOutFromSupabase();
    } catch (error) {
      console.error('[useData] Error signing out from Supabase (non-critical):', error);
      // No re-lanzamos el error porque ya limpiamos el estado local
      // El usuario ya está "desconectado" localmente
    }
  }, []);

  const activateTrial = useCallback(async () => {
    const authUser = await getCurrentAuthUser();
    if (!authUser) {
      throw new Error('Debes iniciar sesión para activar la prueba gratuita.');
    }
    await startTrialForUser(authUser.id);
    setHasActiveTrial(true);
    await syncProfile(authUser);
  }, [syncProfile]);

  const forgotPassword = useCallback(async (email: string) => {
    await resetPassword(email);
  }, []);

  const verifyPasswordResetCode = useCallback(async (email: string, code: string) => {
    const {verifyPasswordResetCode: verifyCode} = await import('../services/supabaseAuth');
    await verifyCode(email, code);
  }, []);

  const updatePassword = useCallback(async (newPassword: string, email?: string) => {
    await updatePasswordInSupabase(newPassword, email);
  }, []);

  const contextValue: IUseData = {
    isDark,
    handleIsDark,
    theme,
    setTheme,
    isAuthenticated,
    hasOnboarded,
    hasActiveTrial,
    isProfileLoading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    activateTrial,
    refreshProfile,
    completeOnboarding,
    forgotPassword,
    verifyPasswordResetCode,
    updatePassword,
    user,
    setUser,
    dashboard,
    setDashboard,
    practice,
    setPractice,
    progress,
    setProgress,
    preferences,
    updatePreferences,
  };

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext) as IUseData;
