const express = require("express");
const {
  addCandidate,
  updateCandidateById,
  deleteCandidateById,
  voting,
  votingCounting,
  getAllCandidate,
} = require("../controllers/candidateController");
const { jwtAuthMiddleware } = require("../middleware/jwt");

const router = express.Router();

router.post("/", jwtAuthMiddleware, addCandidate);
router.put("/:candidateId", updateCandidateById);
router.put("/:candidateId", jwtAuthMiddleware, updateCandidateById);
router.delete("/:candidateId", jwtAuthMiddleware, deleteCandidateById);
router.post("/vote/:candidateId", jwtAuthMiddleware, voting);
router.get("/vote/count", jwtAuthMiddleware, votingCounting);
router.get("/", jwtAuthMiddleware, getAllCandidate);
module.exports = router;
