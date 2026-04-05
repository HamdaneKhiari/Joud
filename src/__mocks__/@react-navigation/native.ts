/**
 * Mock @react-navigation/native for Jest tests
 */

export const useNavigation = jest.fn().mockReturnValue({
  navigate: jest.fn(),
  goBack: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn().mockReturnValue(() => {}),
});

export const useRoute = jest.fn().mockReturnValue({ params: {} });

export const useIsFocused = jest.fn().mockReturnValue(true);

export const useFocusEffect = jest.fn().mockImplementation((cb: () => void) => { cb(); });

export const NavigationContainer = ({ children }: { children: React.ReactNode }) => children;

export const createNavigatorFactory = jest.fn();
export const useNavigationContainerRef = jest.fn();
