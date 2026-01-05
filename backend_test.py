import requests
import sys
import json
from datetime import datetime, timedelta

class GoalTrackingAPITester:
    def __init__(self, base_url="https://meilensteine.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_goals = []
        self.created_habits = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                try:
                    error_data = response.json()
                    details += f", Response: {error_data}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test(name, success, details)
            
            if success:
                try:
                    return response.json()
                except:
                    return {}
            return None

        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return None

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API endpoint", "GET", "", 200)

    def test_goals_crud(self):
        """Test Goals CRUD operations"""
        print("\n🎯 Testing Goals API...")
        
        # Test GET empty goals
        self.run_test("Get goals (empty)", "GET", "goals", 200)
        
        # Test CREATE goal - milestone type
        milestone_goal_data = {
            "title": "Test Milestone Goal",
            "description": "A test milestone goal",
            "category": "health",
            "goal_type": "milestone",
            "deadline": "2024-12-31T23:59:59Z"
        }
        
        milestone_goal = self.run_test("Create milestone goal", "POST", "goals", 200, milestone_goal_data)
        if milestone_goal:
            self.created_goals.append(milestone_goal['id'])
        
        # Test CREATE goal - numeric type
        numeric_goal_data = {
            "title": "Test Numeric Goal",
            "description": "A test numeric goal",
            "category": "career",
            "goal_type": "numeric",
            "target_value": 100,
            "deadline": "2024-12-31T23:59:59Z"
        }
        
        numeric_goal = self.run_test("Create numeric goal", "POST", "goals", 200, numeric_goal_data)
        if numeric_goal:
            self.created_goals.append(numeric_goal['id'])
        
        # Test GET goals (should have 2 now)
        goals = self.run_test("Get goals (with data)", "GET", "goals", 200)
        if goals and len(goals) >= 2:
            self.log_test("Goals list contains created goals", True)
        else:
            self.log_test("Goals list contains created goals", False, f"Expected 2+ goals, got {len(goals) if goals else 0}")
        
        # Test GET single goal
        if self.created_goals:
            goal_id = self.created_goals[0]
            self.run_test("Get single goal", "GET", f"goals/{goal_id}", 200)
            
            # Test UPDATE goal
            update_data = {"title": "Updated Test Goal"}
            self.run_test("Update goal", "PUT", f"goals/{goal_id}", 200, update_data)
            
            # Test update progress for numeric goal
            if len(self.created_goals) > 1:
                numeric_goal_id = self.created_goals[1]
                self.run_test("Update goal progress", "PUT", f"goals/{numeric_goal_id}/progress?value=50", 200)

    def test_milestones(self):
        """Test Milestones functionality"""
        print("\n📍 Testing Milestones API...")
        
        if not self.created_goals:
            self.log_test("Milestones test", False, "No goals available for milestone testing")
            return
        
        goal_id = self.created_goals[0]
        
        # Add milestone
        milestone_data = {"title": "Test Milestone", "deadline": "2024-06-30T23:59:59Z"}
        milestone_result = self.run_test("Add milestone", "POST", f"goals/{goal_id}/milestones", 200, milestone_data)
        
        if milestone_result and milestone_result.get('milestones'):
            milestone_id = milestone_result['milestones'][0]['id']
            
            # Toggle milestone completion
            self.run_test("Toggle milestone", "PUT", f"goals/{goal_id}/milestones/{milestone_id}/toggle", 200)
            
            # Delete milestone
            self.run_test("Delete milestone", "DELETE", f"goals/{goal_id}/milestones/{milestone_id}", 200)

    def test_habits_crud(self):
        """Test Habits CRUD operations"""
        print("\n🔥 Testing Habits API...")
        
        # Test GET empty habits
        self.run_test("Get habits (empty)", "GET", "habits", 200)
        
        # Test CREATE habit
        habit_data = {
            "title": "Test Daily Habit",
            "category": "health"
        }
        
        habit = self.run_test("Create habit", "POST", "habits", 200, habit_data)
        if habit:
            self.created_habits.append(habit['id'])
        
        # Test GET habits (should have 1 now)
        habits = self.run_test("Get habits (with data)", "GET", "habits", 200)
        if habits and len(habits) >= 1:
            self.log_test("Habits list contains created habit", True)
        else:
            self.log_test("Habits list contains created habit", False, f"Expected 1+ habits, got {len(habits) if habits else 0}")

    def test_habit_completion(self):
        """Test Habit completion and streak functionality"""
        print("\n✅ Testing Habit Completion...")
        
        if not self.created_habits:
            self.log_test("Habit completion test", False, "No habits available for completion testing")
            return
        
        habit_id = self.created_habits[0]
        today = datetime.now().strftime('%Y-%m-%d')
        
        # Complete habit for today
        completion_data = {"date": today}
        self.run_test("Complete habit today", "PUT", f"habits/{habit_id}/complete", 200, completion_data)
        
        # Complete habit for yesterday (to test streak)
        yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
        completion_data = {"date": yesterday}
        self.run_test("Complete habit yesterday", "PUT", f"habits/{habit_id}/complete", 200, completion_data)
        
        # Get habit to check streak
        habits = self.run_test("Get habits to check streak", "GET", "habits", 200)
        if habits:
            test_habit = next((h for h in habits if h['id'] == habit_id), None)
            if test_habit and test_habit.get('streak', 0) >= 1:
                self.log_test("Habit streak calculation", True, f"Streak: {test_habit['streak']}")
            else:
                self.log_test("Habit streak calculation", False, f"Expected streak >= 1, got {test_habit.get('streak', 0) if test_habit else 'No habit found'}")

    def test_error_cases(self):
        """Test error handling"""
        print("\n🚫 Testing Error Cases...")
        
        # Test 404 cases
        self.run_test("Get non-existent goal", "GET", "goals/non-existent-id", 404)
        self.run_test("Get non-existent habit", "PUT", "habits/non-existent-id/complete", 404, {"date": "2024-01-01"})
        
        # Test invalid data
        invalid_goal = {"title": "", "category": "invalid", "goal_type": "invalid"}
        self.run_test("Create goal with invalid data", "POST", "goals", 422, invalid_goal)

    def cleanup(self):
        """Clean up created test data"""
        print("\n🧹 Cleaning up test data...")
        
        # Delete created goals
        for goal_id in self.created_goals:
            self.run_test(f"Delete goal {goal_id}", "DELETE", f"goals/{goal_id}", 200)
        
        # Delete created habits
        for habit_id in self.created_habits:
            self.run_test(f"Delete habit {habit_id}", "DELETE", f"habits/{habit_id}", 200)

    def run_all_tests(self):
        """Run all API tests"""
        print(f"🚀 Starting Goal Tracking API Tests")
        print(f"📡 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test basic connectivity
        self.test_root_endpoint()
        
        # Test main functionality
        self.test_goals_crud()
        self.test_milestones()
        self.test_habits_crud()
        self.test_habit_completion()
        
        # Test error cases
        self.test_error_cases()
        
        # Cleanup
        self.cleanup()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"❌ {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    tester = GoalTrackingAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())