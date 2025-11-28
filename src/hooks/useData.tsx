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
  upsertProfile,
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
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null); // null = aún no determinado
  const [hasActiveTrial, setHasActiveTrial] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [hasOnboardedReady, setHasOnboardedReady] = useState(false);
  const isSyncingProfileRef = useRef(false);
  const hasOnboardedReadyRef = useRef(false);

  const completeOnboarding = useCallback(async () => {
    if (!supabase) {
      console.warn('[completeOnboarding] Supabase no disponible, guardando solo localmente');
      setHasOnboarded(true);
      await Storage.setItem('hasOnboarded', JSON.stringify(true));
      return;
    }

    try {
      const authUser = await getCurrentAuthUser();
      if (!authUser) {
        console.warn('[completeOnboarding] Usuario no autenticado, guardando solo localmente');
        setHasOnboarded(true);
        await Storage.setItem('hasOnboarded', JSON.stringify(true));
        return;
      }

      // Guardar en Supabase
      await upsertProfile({
        id: authUser.id,
        has_onboarded: true,
      });

      // Actualizar estado local
      setHasOnboarded(true);
      console.log('[completeOnboarding] Onboarding completado y guardado en Supabase');
    } catch (error) {
      console.error('[completeOnboarding] Error guardando en Supabase, guardando solo localmente:', error);
      // Fallback: guardar solo localmente si falla Supabase
      setHasOnboarded(true);
      await Storage.setItem('hasOnboarded', JSON.stringify(true));
    }
  }, []);

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
    (isDark?: boolean) => {
      if (isDark !== undefined) {
        setIsDark(isDark);
        Storage.setItem('isDark', JSON.stringify(isDark));
      } else {
        // Si no se proporciona valor, alternar el estado actual
        setIsDark(prev => {
          const newValue = !prev;
          Storage.setItem('isDark', JSON.stringify(newValue));
          return newValue;
        });
      }
    },
    [],
  );

  useEffect(() => {
    getIsDark();
    // hasOnboarded se carga desde syncProfile cuando el usuario se autentica
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

  // Recargar progreso cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated) {
      const reloadProgress = async () => {
        try {
          const progressData = await fetchProgressOverview();
          setProgress(progressData);
        } catch (error) {
          console.error('[useData] Error al recargar progreso:', error);
        }
      };
      reloadProgress();
    }
  }, [isAuthenticated]);

  // useEffect para desactivar loading solo después de que hasOnboarded se haya actualizado
  // Esto evita pestañeos en la navegación
  useEffect(() => {
    if (isAuthenticated && isProfileLoading && hasOnboardedReady) {
      // Si estamos autenticados, cargando, y hasOnboarded está listo,
      // esperar un momento para asegurar que React haya procesado el cambio de hasOnboarded
      const timer = setTimeout(() => {
        setIsProfileLoading(false);
        isSyncingProfileRef.current = false;
        console.log('[useEffect] Loading desactivado después de que hasOnboarded esté listo, valor:', hasOnboarded);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, hasOnboarded, isProfileLoading, hasOnboardedReady]);

  const syncProfile = useCallback(
    async (authUser: {id: string; email?: string | null; user_metadata?: Record<string, unknown>}) => {
      if (!supabase) {
        return;
      }

      // Solo activar loading si no estamos ya sincronizando
      // Pero asegurarnos de que hasOnboarded esté en null mientras se carga
      if (!isSyncingProfileRef.current) {
        setIsProfileLoading(true);
        isSyncingProfileRef.current = true;
        setHasOnboarded(null); // Resetear a null mientras se carga
        setHasOnboardedReady(false); // Resetear el flag al iniciar sincronización
        hasOnboardedReadyRef.current = false;
      } else {
        // Si ya estamos sincronizando, asegurarnos de que hasOnboarded esté en null
        setHasOnboarded(null);
      }
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

        // Si el perfil no existe, NO crearlo automáticamente
        // El perfil debe crearse solo cuando el usuario se registra (a través del trigger de Supabase)
        // o cuando se completa el onboarding
        if (!profile) {
          console.warn('[syncProfile] Perfil no existe. El perfil debe crearse al registrarse o al completar el onboarding.');
          // No crear el perfil automáticamente aquí
          // Solo actualizar el estado con la información disponible
          // IMPORTANTE: Establecer hasOnboarded ANTES de desactivar loading
          setHasOnboarded(false); // Usuario nuevo, no ha completado onboarding
          setHasOnboardedReady(true);
          hasOnboardedReadyRef.current = true;
          setUserState(prev => ({
            ...prev,
            id: authUser.id,
            name: googleName,
            avatar: (authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture) as string | undefined,
          }));
          setHasActiveTrial(false);
          // El loading se desactivará automáticamente por el useEffect cuando hasOnboarded se actualice
          return; // Salir temprano, no continuar con la sincronización
        }

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
          } else {
            console.log('[syncProfile] Perfil ya tiene el nombre correcto, no se actualiza');
          }
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
        
        // Cargar has_onboarded desde el perfil (por usuario, no por dispositivo)
        // IMPORTANTE: Establecer hasOnboarded ANTES de desactivar el loading
        // para evitar pestañeos en la navegación
        // Usar un batch de setState para asegurar que se actualicen juntos
        const hasOnboardedValue = profile?.has_onboarded !== null && profile?.has_onboarded !== undefined
          ? Boolean(profile.has_onboarded)
          : false; // Si no está definido, asumir que no ha completado onboarding
        
        // Establecer hasOnboarded y marcar como listo
        setHasOnboarded(hasOnboardedValue);
        setHasOnboardedReady(true);
        hasOnboardedReadyRef.current = true;
        console.log('[syncProfile] has_onboarded establecido:', hasOnboardedValue, '(desde perfil:', profile?.has_onboarded, ')');
        
        console.log('[syncProfile] Sincronización completada');
        // El loading se desactivará automáticamente por el useEffect cuando hasOnboarded se actualice
      } catch (error) {
        console.error('[syncProfile] Error sincronizando perfil:', error);
        throw error;
      } finally {
        // No desactivar loading aquí, dejar que el useEffect lo maneje
        // Esto asegura que hasOnboarded se haya actualizado antes de desactivar el loading
      }
    },
    [],
  );

  const refreshProfile = useCallback(async () => {
    const authUser = await getCurrentAuthUser();
    if (authUser) {
      setHasOnboarded(null); // Resetear a null mientras se carga
      setIsProfileLoading(true);
      setIsAuthenticated(true);
      await syncProfile(authUser);
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
        // Validar que el usuario realmente existe verificando el perfil
        try {
          const profile = await fetchProfileById(authUser.id);
          if (profile) {
            // Usuario existe, establecer estados ANTES de sincronizar
            setHasOnboarded(null); // Resetear a null mientras se carga
            setIsProfileLoading(true);
            setIsAuthenticated(true);
            await syncProfile(authUser);
          } else {
            // Usuario no existe en Supabase, limpiar sesión local
            console.log('[getSession] Usuario no existe en Supabase, limpiando sesión local');
            await signOutFromSupabase();
            setIsAuthenticated(false);
            setHasActiveTrial(false);
            setHasOnboarded(null);
            setUserState(DEFAULT_USER);
            await Storage.removeItem('hasOnboarded');
          }
        } catch (error) {
          // Error al verificar perfil, asumir que el usuario no existe
          console.error('[getSession] Error verificando perfil, limpiando sesión:', error);
          await signOutFromSupabase();
          setIsAuthenticated(false);
          setHasActiveTrial(false);
          setHasOnboarded(false);
          setUserState(DEFAULT_USER);
          await Storage.removeItem('hasOnboarded');
        }
      } else {
        setIsAuthenticated(false);
        setHasActiveTrial(false);
        setHasOnboarded(null); // Resetear a null cuando no hay sesión
        setHasOnboardedReady(false);
        hasOnboardedReadyRef.current = false;
        setUserState(DEFAULT_USER);
        // Limpiar también de AsyncStorage por si acaso
        await Storage.removeItem('hasOnboarded');
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
          console.log('[onAuthStateChange] Usuario autenticado, verificando perfil...', event);
          // Validar que el usuario realmente existe
          try {
            const profile = await fetchProfileById(session.user.id);
            if (profile) {
              // Usuario existe, establecer estados ANTES de sincronizar
              setHasOnboarded(null); // Resetear a null mientras se carga
              setIsProfileLoading(true);
              setIsAuthenticated(true);
              await syncProfile(session.user);
            } else {
              // Usuario no existe, limpiar sesión
              console.log('[onAuthStateChange] Usuario no existe en Supabase, limpiando sesión');
              await signOutFromSupabase();
              setIsAuthenticated(false);
              setHasActiveTrial(false);
              setHasOnboarded(false);
              setUserState(DEFAULT_USER);
              await Storage.removeItem('hasOnboarded');
            }
          } catch (error) {
            // Error al verificar, limpiar sesión
            console.error('[onAuthStateChange] Error verificando perfil, limpiando sesión:', error);
            await signOutFromSupabase();
            setIsAuthenticated(false);
            setHasActiveTrial(false);
            setHasOnboarded(null);
            setUserState(DEFAULT_USER);
            await Storage.removeItem('hasOnboarded');
          }
        } else {
          console.log('[onAuthStateChange] Usuario no autenticado, limpiando estado...', event);
          setIsAuthenticated(false);
          setHasActiveTrial(false);
          setHasOnboarded(false); // Limpiar hasOnboarded cuando no hay sesión
          setHasOnboardedReady(false);
          hasOnboardedReadyRef.current = false;
          setUserState(DEFAULT_USER);
          // Limpiar también de AsyncStorage por si acaso
          await Storage.removeItem('hasOnboarded');
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
      // Establecer estados ANTES de sincronizar para evitar pestañeos
      setHasOnboarded(null); // Resetear a null mientras se carga
      setIsProfileLoading(true);
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
      
      // Establecer estados ANTES de sincronizar para evitar pestañeos
      setHasOnboarded(null); // Resetear a null mientras se carga
      setIsProfileLoading(true);
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
      setHasOnboarded(null); // Resetear a null mientras se carga
      setIsProfileLoading(true);
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
    setHasOnboarded(null); // Resetear a null al cerrar sesión
    setHasOnboardedReady(false);
    hasOnboardedReadyRef.current = false;
    setUserState(DEFAULT_USER);
    
    // Limpiar AsyncStorage
    await Storage.removeItem('hasOnboarded');
    
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
