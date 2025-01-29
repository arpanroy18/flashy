import React, { useState, useEffect } from 'react';
import { Timer, Settings, Play, Pause, RotateCcw, Coffee, ChevronUp, ChevronDown } from 'lucide-react';

interface TimerSettings {
  studyTime: number;
  breakTime: number;
  longBreakTime: number;
  sessionsUntilLongBreak: number;
}

export function PomodoroTimer() {
  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // Default 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Timer settings with defaults
  const [settings, setSettings] = useState<TimerSettings>(() => {
    const savedSettings = localStorage.getItem('pomodoroSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      studyTime: 25,
      breakTime: 5,
      longBreakTime: 15,
      sessionsUntilLongBreak: 4
    };
  });

  // Load timer state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('pomodoroState');
    if (savedState) {
      const { timeLeft, isRunning, isBreak, sessionCount } = JSON.parse(savedState);
      setTimeLeft(timeLeft);
      setIsRunning(isRunning);
      setIsBreak(isBreak);
      setSessionCount(sessionCount);
    }
  }, []);

  // Save timer state to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoroState', JSON.stringify({
      timeLeft,
      isRunning,
      isBreak,
      sessionCount
    }));
  }, [timeLeft, isRunning, isBreak, sessionCount]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
  }, [settings]);

  // Timer logic
  useEffect(() => {
    let interval: number | undefined;

    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Play notification sound
      const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
      audio.play().catch(() => {}); // Ignore errors if audio can't play

      // Switch between study and break
      if (!isBreak) {
        const newSessionCount = sessionCount + 1;
        setSessionCount(newSessionCount);
        setIsBreak(true);
        
        // Determine if it should be a long break
        if (newSessionCount % settings.sessionsUntilLongBreak === 0) {
          setTimeLeft(settings.longBreakTime * 60);
        } else {
          setTimeLeft(settings.breakTime * 60);
        }
      } else {
        setIsBreak(false);
        setTimeLeft(settings.studyTime * 60);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, sessionCount, settings]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(settings.studyTime * 60);
    setSessionCount(0);
  };

  const handleSkip = () => {
    if (isBreak) {
      setIsBreak(false);
      setTimeLeft(settings.studyTime * 60);
    } else {
      const newSessionCount = sessionCount + 1;
      setSessionCount(newSessionCount);
      setIsBreak(true);
      setTimeLeft(newSessionCount % settings.sessionsUntilLongBreak === 0 ? settings.longBreakTime * 60 : settings.breakTime * 60);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 w-64 bg-dashboard-card border-t border-gray-700 z-50">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isBreak ? 
              <Coffee size={20} className="text-dashboard-accent" /> :
              <Timer size={20} className="text-dashboard-accent" />
            }
            <span className="font-medium">{isBreak ? 'Break Time' : 'Study Time'}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-dashboard-bg rounded-lg transition-colors"
            >
              {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {!isMinimized && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-dashboard-bg rounded-lg transition-colors"
              >
                <Settings size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Only show these sections when not minimized */}
        {!isMinimized && (
          <>
            {showSettings && (
              <div className="mb-4 p-4 bg-dashboard-bg rounded-lg">
                <h4 className="text-sm font-medium mb-3">Timer Settings</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-400">Study Time (minutes)</label>
                    <input
                      type="number"
                      value={settings.studyTime}
                      onChange={(e) => setSettings(s => ({ ...s, studyTime: parseInt(e.target.value) }))}
                      className="w-full bg-dashboard-card p-1 rounded text-sm"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Break Time (minutes)</label>
                    <input
                      type="number"
                      value={settings.breakTime}
                      onChange={(e) => setSettings(s => ({ ...s, breakTime: parseInt(e.target.value) }))}
                      className="w-full bg-dashboard-card p-1 rounded text-sm"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Long Break Time (minutes)</label>
                    <input
                      type="number"
                      value={settings.longBreakTime}
                      onChange={(e) => setSettings(s => ({ ...s, longBreakTime: parseInt(e.target.value) }))}
                      className="w-full bg-dashboard-card p-1 rounded text-sm"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Sessions until Long Break</label>
                    <input
                      type="number"
                      value={settings.sessionsUntilLongBreak}
                      onChange={(e) => setSettings(s => ({ ...s, sessionsUntilLongBreak: parseInt(e.target.value) }))}
                      className="w-full bg-dashboard-card p-1 rounded text-sm"
                      min="1"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="text-center mb-4">
              <div className="text-3xl font-mono font-bold mb-2">{formatTime(timeLeft)}</div>
              <div className="text-xs text-gray-400">
                Session {sessionCount % settings.sessionsUntilLongBreak || settings.sessionsUntilLongBreak} / {settings.sessionsUntilLongBreak}
              </div>
            </div>

            <div className="flex justify-center gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="p-2 bg-dashboard-accent hover:bg-dashboard-accent-hover text-white rounded-lg transition-colors"
              >
                {isRunning ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button
                onClick={handleReset}
                className="p-2 hover:bg-dashboard-bg rounded-lg transition-colors"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={handleSkip}
                className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
              >
                Skip
              </button>
            </div>
          </>
        )}

        {/* Show minimal view when minimized */}
        {isMinimized && (
          <div className="text-center">
            <div className="text-xl font-mono font-bold">{formatTime(timeLeft)}</div>
          </div>
        )}
      </div>
    </div>
  );
}