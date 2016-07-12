import unittest

import body

class TestBodyFunctions(unittest.TestCase):
    def test_BCS_max(self):
        self.assertAlmostEqual(body.BCS(340, 12, 60, 60), body.BCS_MAX, places=7,
                               msg="BCS not max in dry period")

    def test_BCS_min(self):
        self.assertAlmostEqual(body.BCS(10+body.DAYS_ZERO_MOBILIZATION_AFTER_MILK_PEAK, 12, 60, 10), body.BCS_MIN, places=7,
                               msg="BCS not min at start of mobilisation")


if __name__ == '__main__':
    unittest.main()
