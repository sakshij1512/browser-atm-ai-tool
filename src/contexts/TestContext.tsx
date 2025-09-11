import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { testService } from '../services/api';

interface TestState {
  configurations: any[];
  results: any[];
  loading: boolean;
  error: string | null;
  dashboardData: any;
}

interface TestAction {
  type: string;
  payload?: any;
}

const initialState: TestState = {
  configurations: [],
  results: [],
  loading: false,
  error: null,
  dashboardData: null
};

function testReducer(state: TestState, action: TestAction): TestState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_CONFIGURATIONS':
      return { ...state, configurations: action.payload, loading: false };
    case 'ADD_CONFIGURATION':
      return { 
        ...state, 
        configurations: [action.payload, ...state.configurations],
        loading: false 
      };
    case 'UPDATE_CONFIGURATION':
      return {
        ...state,
        configurations: state.configurations.map(config =>
          config._id === action.payload._id ? action.payload : config
        ),
        loading: false
      };
    case 'DELETE_CONFIGURATION':
      return {
        ...state,
        configurations: state.configurations.filter(config => config._id !== action.payload),
        loading: false
      };
    case 'SET_RESULTS':
      return { ...state, results: action.payload, loading: false };
    case 'SET_DASHBOARD_DATA':
      return { ...state, dashboardData: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

const TestContext = createContext<{
  state: TestState;
  dispatch: React.Dispatch<TestAction>;
  actions: {
    loadConfigurations: () => Promise<void>;
    createConfiguration: (config: any) => Promise<void>;
    updateConfiguration: (id: string, config: any) => Promise<void>;
    deleteConfiguration: (id: string) => Promise<void>;
    runTest: (configId: string) => Promise<void>;
    loadResults: (configId?: string) => Promise<void>;
    loadDashboardData: () => Promise<void>;
  };
} | null>(null);

export const TestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(testReducer, initialState);

  const actions = {
    loadConfigurations: async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const configurations = await testService.getConfigurations();
        dispatch({ type: 'SET_CONFIGURATIONS', payload: configurations });
      } catch (error: any) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    },

    createConfiguration: async (config: any) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const newConfig = await testService.createConfiguration(config);
        dispatch({ type: 'ADD_CONFIGURATION', payload: newConfig });
      } catch (error: any) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    },

    updateConfiguration: async (id: string, config: any) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const updatedConfig = await testService.updateConfiguration(id, config);
        dispatch({ type: 'UPDATE_CONFIGURATION', payload: updatedConfig });
      } catch (error: any) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    },

    deleteConfiguration: async (id: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        await testService.deleteConfiguration(id);
        dispatch({ type: 'DELETE_CONFIGURATION', payload: id });
      } catch (error: any) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    },

    runTest: async (configId: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        await testService.runTest(configId);
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error: any) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    },

    loadResults: async (configId?: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const results = await testService.getResults(configId);
        console.log("Results", results)
        dispatch({ type: 'SET_RESULTS', payload: results.results });
      } catch (error: any) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    },

    loadDashboardData: async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const dashboardData = await testService.getDashboardData();
        dispatch({ type: 'SET_DASHBOARD_DATA', payload: dashboardData });
      } catch (error: any) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    }
  };

  useEffect(() => {
    actions.loadConfigurations();
    actions.loadDashboardData();
  }, []);

  return (
    <TestContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </TestContext.Provider>
  );
};

export const useTest = () => {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error('useTest must be used within a TestProvider');
  }
  return context;
};