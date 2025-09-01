package com.mastercredits;

import java.util.*;
import java.security.SecureRandom;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class GameEngine {
    private static final SecureRandom random = new SecureRandom();
    private static final Gson gson = new GsonBuilder().create();
    
    public static void main(String[] args) {
        if (args.length < 2) {
            System.err.println("Usage: GameEngine <gameType> <gameData>");
            System.exit(1);
        }
        
        String gameType = args[0];
        String gameDataJson = args[1];
        
        try {
            GameResult result = processGame(gameType, gameDataJson);
            System.out.println(gson.toJson(result));
        } catch (Exception e) {
            GameResult errorResult = new GameResult();
            errorResult.success = false;
            errorResult.error = e.getMessage();
            System.out.println(gson.toJson(errorResult));
        }
    }
    
    public static GameResult processGame(String gameType, String gameDataJson) throws Exception {
        Map<String, Object> gameData = gson.fromJson(gameDataJson, Map.class);
        
        switch (gameType.toLowerCase()) {
            case "blackjack":
                return playBlackjack(gameData);
            case "coinflip":
                return playCoinflip(gameData);
            case "starbound":
                return playStarbound(gameData);
            case "blacksmith":
                return playBlacksmith(gameData);
            default:
                throw new IllegalArgumentException("Unknown game type: " + gameType);
        }
    }
    
    public static GameResult playBlackjack(Map<String, Object> gameData) {
        double betAmount = ((Number) gameData.get("betAmount")).doubleValue();
        String action = (String) gameData.getOrDefault("action", "deal");
        
        GameResult result = new GameResult();
        result.gameType = "blackjack";
        result.betAmount = betAmount;
        
        if ("deal".equals(action)) {
            List<Card> playerHand = new ArrayList<>();
            List<Card> dealerHand = new ArrayList<>();
            
            playerHand.add(dealCard());
            dealerHand.add(dealCard());
            playerHand.add(dealCard());
            dealerHand.add(dealCard());
            
            int playerScore = calculateBlackjackScore(playerHand);
            int dealerUpCard = dealerHand.get(0).value > 10 ? 10 : dealerHand.get(0).value;
            
            result.data.put("playerHand", playerHand);
            result.data.put("dealerHand", Arrays.asList(dealerHand.get(0), new Card("Hidden", 0)));
            result.data.put("playerScore", playerScore);
            result.data.put("dealerUpCard", dealerUpCard);
            result.data.put("gameState", playerScore == 21 ? "player_blackjack" : "player_turn");
            
            if (playerScore == 21) {
                dealerHand.get(1).suit = dealerHand.get(1).suit;
                int dealerScore = calculateBlackjackScore(dealerHand);
                result.data.put("dealerHand", dealerHand);
                result.data.put("dealerScore", dealerScore);
                
                if (dealerScore == 21) {
                    result.payout = betAmount;
                    result.data.put("result", "push");
                } else {
                    result.payout = betAmount * 2.5;
                    result.data.put("result", "player_blackjack");
                }
                result.data.put("gameState", "finished");
            }
            
        } else if ("hit".equals(action)) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> handData = (List<Map<String, Object>>) gameData.get("playerHand");
            List<Card> playerHand = new ArrayList<>();
            for (Map<String, Object> cardData : handData) {
                playerHand.add(new Card((String) cardData.get("suit"), ((Number) cardData.get("value")).intValue()));
            }
            
            playerHand.add(dealCard());
            int playerScore = calculateBlackjackScore(playerHand);
            
            result.data.put("playerHand", playerHand);
            result.data.put("playerScore", playerScore);
            
            // Preserve dealer hand from the original game data
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> dealerHandData = (List<Map<String, Object>>) gameData.get("dealerHand");
            if (dealerHandData != null) {
                result.data.put("dealerHand", dealerHandData);
            }
            
            if (playerScore > 21) {
                result.payout = 0;
                result.data.put("result", "player_bust");
                result.data.put("gameState", "finished");
            } else {
                result.data.put("gameState", "player_turn");
            }
            
        } else if ("stand".equals(action)) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> playerHandData = (List<Map<String, Object>>) gameData.get("playerHand");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> dealerHandData = (List<Map<String, Object>>) gameData.get("dealerHand");
            
            List<Card> playerHand = new ArrayList<>();
            for (Map<String, Object> cardData : playerHandData) {
                playerHand.add(new Card((String) cardData.get("suit"), ((Number) cardData.get("value")).intValue()));
            }
            
            List<Card> dealerHand = new ArrayList<>();
            if (dealerHandData != null) {
                for (Map<String, Object> cardData : dealerHandData) {
                    if (!"Hidden".equals(cardData.get("suit"))) {
                        dealerHand.add(new Card((String) cardData.get("suit"), ((Number) cardData.get("value")).intValue()));
                    }
                }
            }
            
            // If dealer hand is empty, deal two cards
            if (dealerHand.isEmpty()) {
                dealerHand.add(dealCard());
                dealerHand.add(dealCard());
            } else {
                dealerHand.add(dealCard());
            }
            
            while (calculateBlackjackScore(dealerHand) < 17) {
                dealerHand.add(dealCard());
            }
            
            int playerScore = calculateBlackjackScore(playerHand);
            int dealerScore = calculateBlackjackScore(dealerHand);
            
            result.data.put("playerHand", playerHand);
            result.data.put("dealerHand", dealerHand);
            result.data.put("playerScore", playerScore);
            result.data.put("dealerScore", dealerScore);
            result.data.put("gameState", "finished");
            
            if (dealerScore > 21) {
                result.payout = betAmount * 2;
                result.data.put("result", "dealer_bust");
            } else if (playerScore > dealerScore) {
                result.payout = betAmount * 2;
                result.data.put("result", "player_wins");
            } else if (dealerScore > playerScore) {
                result.payout = 0;
                result.data.put("result", "dealer_wins");
            } else {
                result.payout = betAmount;
                result.data.put("result", "push");
            }
        }
        
        result.success = true;
        result.experienceGained = (int) (betAmount / 1000);
        return result;
    }
    
    public static GameResult playCoinflip(Map<String, Object> gameData) {
        double betAmount = ((Number) gameData.get("betAmount")).doubleValue();
        String playerChoice = (String) gameData.get("choice");
        
        GameResult result = new GameResult();
        result.gameType = "coinflip";
        result.betAmount = betAmount;
        
        boolean coinResult = random.nextBoolean();
        String coinSide = coinResult ? "heads" : "tails";
        
        result.data.put("coinResult", coinSide);
        result.data.put("playerChoice", playerChoice);
        
        if (playerChoice.equals(coinSide)) {
            result.payout = betAmount * 1.95;
            result.data.put("result", "win");
        } else {
            result.payout = 0;
            result.data.put("result", "lose");
        }
        
        result.success = true;
        result.experienceGained = (int) (betAmount / 2000);
        return result;
    }
    
    public static GameResult playStarbound(Map<String, Object> gameData) {
        double betAmount = ((Number) gameData.get("betAmount")).doubleValue();
        int numLines = ((Number) gameData.getOrDefault("lines", 1)).intValue();
        
        GameResult result = new GameResult();
        result.gameType = "starbound";
        result.betAmount = betAmount;
        
        // Expanded symbols with more variety
        String[] symbols = {"DOG", "ROCKET", "STAR", "SHINE", "UFO", "PAW", "FIRE", "GEM", "BONE", "PLANET", "COMET", "ASTEROID"};
        
        // Reduced payouts for 3+ consecutive symbols
        double[] payouts3Plus = {25, 15, 10, 8, 6, 4, 3, 2, 2, 1.5, 1.2, 1};
        
        // New: Small payouts for 2 consecutive symbols (20% chance)
        double[] payouts2 = {2, 1.5, 1.2, 1, 0.8, 0.6, 0.5, 0.4, 0.3, 0.25, 0.2, 0.2};
        
        List<List<String>> reels = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            List<String> reel = new ArrayList<>();
            for (int j = 0; j < 3; j++) {
                reel.add(symbols[random.nextInt(symbols.length)]);
            }
            reels.add(reel);
        }
        
        result.data.put("reels", reels);
        result.data.put("lines", numLines);
        
        double totalPayout = 0;
        List<Map<String, Object>> winningLines = new ArrayList<>();
        
        for (int line = 0; line < numLines; line++) {
            List<String> lineSymbols = new ArrayList<>();
            for (int reel = 0; reel < 5; reel++) {
                int row = (line + reel) % 3;
                lineSymbols.add(reels.get(reel).get(row));
            }
            
            int consecutiveCount = 1;
            String firstSymbol = lineSymbols.get(0);
            
            for (int i = 1; i < lineSymbols.size(); i++) {
                if (lineSymbols.get(i).equals(firstSymbol)) {
                    consecutiveCount++;
                } else {
                    break;
                }
            }
            
            int symbolIndex = Arrays.asList(symbols).indexOf(firstSymbol);
            
            // 3+ consecutive symbols - higher payouts
            if (consecutiveCount >= 3 && symbolIndex != -1) {
                double linePayout = (betAmount / numLines) * payouts3Plus[symbolIndex] * (consecutiveCount - 2);
                totalPayout += linePayout;
                
                Map<String, Object> winLine = new HashMap<>();
                winLine.put("line", line);
                winLine.put("symbol", firstSymbol);
                winLine.put("count", consecutiveCount);
                winLine.put("payout", linePayout);
                winLine.put("type", "consecutive");
                winningLines.add(winLine);
            }
            // NEW: 2 consecutive symbols - small payouts (more frequent wins)
            else if (consecutiveCount == 2 && symbolIndex != -1) {
                double linePayout = (betAmount / numLines) * payouts2[symbolIndex];
                totalPayout += linePayout;
                
                Map<String, Object> winLine = new HashMap<>();
                winLine.put("line", line);
                winLine.put("symbol", firstSymbol);
                winLine.put("count", consecutiveCount);
                winLine.put("payout", linePayout);
                winLine.put("type", "pair");
                winningLines.add(winLine);
            }
        }
        
        // NEW: Scatter bonuses - any 3+ of same symbol anywhere on reels
        Map<String, Integer> scatterCounts = new HashMap<>();
        for (List<String> reel : reels) {
            for (String symbol : reel) {
                scatterCounts.put(symbol, scatterCounts.getOrDefault(symbol, 0) + 1);
            }
        }
        
        for (Map.Entry<String, Integer> entry : scatterCounts.entrySet()) {
            String symbol = entry.getKey();
            int count = entry.getValue();
            
            if (count >= 6) { // 6+ scattered symbols
                int symbolIndex = Arrays.asList(symbols).indexOf(symbol);
                if (symbolIndex != -1) {
                    double scatterPayout = betAmount * 0.5 * (count - 5); // Modest scatter bonus
                    totalPayout += scatterPayout;
                    
                    Map<String, Object> scatterWin = new HashMap<>();
                    scatterWin.put("line", -1);
                    scatterWin.put("symbol", symbol);
                    scatterWin.put("count", count);
                    scatterWin.put("payout", scatterPayout);
                    scatterWin.put("type", "scatter");
                    winningLines.add(scatterWin);
                }
            }
        }
        
        result.data.put("winningLines", winningLines);
        result.payout = totalPayout;
        result.success = true;
        result.experienceGained = (int) (betAmount / 1500);
        
        return result;
    }
    
    private static Card dealCard() {
        String[] suits = {"♠", "♥", "♦", "♣"};
        String[] ranks = {"A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"};
        int[] values = {11, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10};
        
        int suitIndex = random.nextInt(suits.length);
        int rankIndex = random.nextInt(ranks.length);
        
        return new Card(suits[suitIndex] + ranks[rankIndex], values[rankIndex]);
    }
    
    private static int calculateBlackjackScore(List<Card> hand) {
        int score = 0;
        int aces = 0;
        
        for (Card card : hand) {
            score += card.value;
            if (card.value == 11) {
                aces++;
            }
        }
        
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }
        
        return score;
    }
    
    public static GameResult playBlacksmith(Map<String, Object> gameData) {
        double betAmount = ((Number) gameData.get("betAmount")).doubleValue();
        String action = (String) gameData.getOrDefault("action", "sell");
        
        GameResult result = new GameResult();
        
        if ("sell".equals(action)) {
            int itemIndex = ((Number) gameData.get("itemIndex")).intValue();
            @SuppressWarnings("unchecked")
            Map<String, Object> selectedItemData = (Map<String, Object>) gameData.get("selectedItem");
            
            String itemName = (String) selectedItemData.get("name");
            String itemIcon = (String) selectedItemData.get("icon");
            String itemQuality = (String) selectedItemData.get("quality");
            
            // Merchant multiplier based on item quality and randomness
            double merchantMultiplier = calculateMerchantMultiplier(itemQuality);
            
            // Calculate final payout (this is what the merchant pays)
            result.payout = betAmount * merchantMultiplier;
            
            // Store merchant result data
            result.data.put("selectedItem", selectedItemData);
            result.data.put("itemIndex", itemIndex);
            result.data.put("itemName", itemName);
            result.data.put("itemIcon", itemIcon);
            result.data.put("itemQuality", itemQuality);
            result.data.put("merchantMultiplier", merchantMultiplier);
            result.data.put("betAmount", betAmount);
            result.data.put("totalPayout", result.payout);
            
            // Experience based on bet amount
            result.experienceGained = Math.max(1, (int) (betAmount / 2500));
            
            result.success = true;
        }
        
        return result;
    }
    
    private static double calculateMerchantMultiplier(String quality) {
        // Base multiplier ranges by quality, with significant randomness
        double baseMin, baseMax;
        
        switch (quality.toLowerCase()) {
            case "cursed":
                baseMin = 0.1; baseMax = 0.8; // High risk of loss
                break;
            case "common":
                baseMin = 0.5; baseMax = 1.5;
                break;
            case "uncommon":
                baseMin = 0.7; baseMax = 2.0;
                break;
            case "rare":
                baseMin = 0.8; baseMax = 3.0;
                break;
            case "epic":
                baseMin = 1.0; baseMax = 4.0;
                break;
            case "legendary":
                baseMin = 1.2; baseMax = 6.0;
                break;
            case "mythic":
                baseMin = 1.5; baseMax = 8.0;
                break;
            case "artifact":
                baseMin = 2.0; baseMax = 10.0;
                break;
            default:
                baseMin = 0.5; baseMax = 1.5;
        }
        
        // Add randomness within the quality range
        double multiplier = baseMin + (random.nextDouble() * (baseMax - baseMin));
        
        // Round to 2 decimal places
        return Math.round(multiplier * 100.0) / 100.0;
    }
    
    static class Card {
        String suit;
        int value;
        
        Card(String suit, int value) {
            this.suit = suit;
            this.value = value;
        }
    }
    
    static class GameResult {
        boolean success = false;
        String gameType;
        double betAmount;
        double payout = 0;
        int experienceGained = 0;
        String error;
        Map<String, Object> data = new HashMap<>();
    }
}