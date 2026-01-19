import { useCallback, useEffect, useRef, useState } from 'react';
import { createStorageService, STORAGE_MESSAGE_KEYS } from '../../data/storage.js';

/**
 * Hydrate and persist app state with the storage service.
 * Assumes project/template state is managed by the caller.
 */
export const useStorageHydration = ({
  t,
  locale,
  projects,
  templates,
  history,
  setProjects,
  setTemplates,
  setHistory,
  setStatus
}) => {
  const [lastSaved, setLastSaved] = useState(null);
  const [theme, setTheme] = useState('light');
  const [showAutoBackups, setShowAutoBackups] = useState(false);
  const [autoBackups, setAutoBackups] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const storageRef = useRef(null);
  const tRef = useRef(t);

  const resolveStorageMessage = useCallback(
    (message, variables) => {
      if (!message) {
        return '';
      }
      if (
        typeof message === 'string' &&
        (message.startsWith('warnings.') || message.startsWith('errors.'))
      ) {
        return t(message, undefined, variables);
      }
      return message;
    },
    [t]
  );

  const resolveStorageSource = useCallback(
    (source) => {
      if (!source) {
        return '';
      }
      if (typeof source === 'string' && source.startsWith('sources.')) {
        return t(source);
      }
      return source;
    },
    [t]
  );

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t('meta.title', 'Gear list editor');
  }, [locale, t]);

  if (!storageRef.current) {
    storageRef.current = createStorageService({
      onSaved: (payload, { reason, warnings }) => {
        const tCurrent = tRef.current;
        setLastSaved(payload.lastSaved);
        if (warnings?.length) {
          const warning = warnings[0];
          setStatus(
            typeof warning === 'string' &&
              (warning.startsWith('warnings.') || warning.startsWith('errors.'))
              ? tCurrent(warning)
              : warning
          );
          return;
        }
        if (reason === 'autosave') {
          setStatus(
            tCurrent('status.autosaveComplete', 'Autosave complete. Your project dashboard is safe.')
          );
        } else if (reason === 'explicit') {
          setStatus(tCurrent('status.saveComplete', 'Saved safely to device storage and backups.'));
        } else if (reason === 'rehydrate') {
          setStatus(tCurrent('status.storageRepaired', 'Storage repaired and redundancies refreshed.'));
        }
      },
      onWarning: (message) => {
        const tCurrent = tRef.current;
        setStatus(
          typeof message === 'string' &&
            (message.startsWith('warnings.') || message.startsWith('errors.'))
            ? tCurrent(message)
            : message
        );
      }
    });
  }

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const result = await storageRef.current.loadState();
      if (!mounted) {
        return;
      }
      setProjects(result.state.projects);
      setTemplates(result.state.templates);
      setHistory(result.state.history);
      // activeProjectId is no longer managed here
      setLastSaved(result.state.lastSaved);
      setTheme(result.state.theme || 'light');
      setShowAutoBackups(Boolean(result.state.showAutoBackups));
      if (result.warnings.length > 0) {
        setStatus(resolveStorageMessage(result.warnings[0]));
      } else {
        const localizedSource = resolveStorageSource(result.source);
        setStatus(
          result.source === STORAGE_MESSAGE_KEYS.sources.empty
            ? t(
              'status.noSavedData',
              'No saved data yet. Start a project and autosave will protect it.'
            )
            : t('status.loadedFromSource', 'Loaded safely from {source}.', {
              source: localizedSource
            })
        );
      }
      setIsHydrated(true);
    };
    load();
    return () => {
      mounted = false;
      storageRef.current?.dispose();
    };
  }, [
    resolveStorageMessage,
    resolveStorageSource,
    setHistory,
    setProjects,
    setStatus,
    setTemplates,
    t
  ]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    storageRef.current.scheduleAutosave({
      theme,
      projects,
      templates,
      history,
      activeProjectId: null, // Legacy support
      lastSaved,
      showAutoBackups
    });
  }, [
    projects,
    templates,
    history,
    isHydrated,
    theme,
    showAutoBackups,
    lastSaved
  ]);

  useEffect(() => {
    if (!isHydrated || !showAutoBackups) {
      setAutoBackups([]);
      return;
    }
    let mounted = true;
    const loadAutoBackups = async () => {
      const backups = await storageRef.current.listAutoBackups();
      if (mounted) {
        setAutoBackups(backups);
      }
    };
    loadAutoBackups();
    return () => {
      mounted = false;
    };
  }, [isHydrated, lastSaved, showAutoBackups]);

  const exportBackup = useCallback(
    () =>
      storageRef.current.exportBackup({
        theme,
        projects,
        templates,
        history,
        activeProjectId: null,
        lastSaved,
        showAutoBackups
      }),
    [history, lastSaved, projects, showAutoBackups, templates, theme]
  );

  const exportProjectBackup = useCallback(
    (projectId) =>
      storageRef.current.exportProjectBackup(
        {
          theme,
          projects,
          templates,
          history,
          activeProjectId: null,
          lastSaved,
          showAutoBackups
        },
        projectId
      ),
    [history, lastSaved, projects, showAutoBackups, templates, theme]
  );

  const importBackupFile = useCallback(
    (file) => {
      if (!file) {
        return Promise.resolve(null);
      }
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const { state, warnings } = storageRef.current.importBackup(reader.result, {
            theme,
            projects,
            templates,
            history,
            activeProjectId: null,
            lastSaved,
            showAutoBackups
          });
          setProjects(state.projects);
          setTemplates(state.templates);
          setHistory(state.history);
          if (state.theme) {
            setTheme(state.theme);
          }
          if (typeof state.showAutoBackups === 'boolean') {
            setShowAutoBackups(state.showAutoBackups);
          }
          // setActiveProjectId(state.activeProjectId); // Removed
          resolve({ state, warnings });
        };
        reader.readAsText(file);
      });
    },
    [
      history,
      lastSaved,
      projects,
      setHistory,
      setProjects,
      setTemplates,
      setTheme,
      setShowAutoBackups,
      showAutoBackups,
      templates,
      theme
    ]
  );

  const restoreFromDeviceBackup = useCallback(async () => {
    const result = await storageRef.current.restoreFromBackup();
    setProjects(result.state.projects);
    setTemplates(result.state.templates);
    setHistory(result.state.history);
    if (result.state.theme) {
      setTheme(result.state.theme);
    }
    if (typeof result.state.showAutoBackups === 'boolean') {
      setShowAutoBackups(result.state.showAutoBackups);
    }
    // setActiveProjectId(result.state.activeProjectId); // Removed
    setLastSaved(result.state.lastSaved);
    if (result.warnings.length > 0) {
      setStatus(resolveStorageMessage(result.warnings[0]));
      return;
    }
    const saveResult = await storageRef.current.saveNow(result.state);
    if (saveResult?.warnings?.length) {
      setStatus(resolveStorageMessage(saveResult.warnings[0]));
      return;
    }
    setStatus(
      t('status.restoredFromSource', 'Restored from {source} and saved safely.', {
        source: resolveStorageSource(result.source)
      })
    );
  }, [
    resolveStorageMessage,
    resolveStorageSource,
    setHistory,
    setProjects,
    setStatus,
    setTemplates,
    setTheme,
    setShowAutoBackups,
    t
  ]);

  return {
    storageRef,
    lastSaved,
    setLastSaved,
    theme,
    setTheme,
    showAutoBackups,
    setShowAutoBackups,
    autoBackups,
    isHydrated,
    exportBackup,
    exportProjectBackup,
    importBackupFile,
    restoreFromDeviceBackup,
    resolveStorageMessage,
    resolveStorageSource
  };
};
