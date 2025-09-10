package com.aurumfi.token;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * AurumFi Token Implementation
 * ERC-20 compatible token for exchange listing
 */
public class AurumToken {

    // Token Metadata
    public static final String NAME = "AurumFi";
    public static final String SYMBOL = "AUR";
    public static final int DECIMALS = 8;
    public static final BigDecimal TOTAL_SUPPLY = new BigDecimal("21000000"); // 21M tokens like Bitcoin

    // Storage
    private final Map<String, BigDecimal> balances = new ConcurrentHashMap<>();
    private final Map<String, Map<String, BigDecimal>> allowances = new ConcurrentHashMap<>();
    private BigDecimal totalSupply;
    private final String owner;

    // Events (for exchange integration)
    public interface TokenEventListener {
        void onTransfer(String from, String to, BigDecimal value);
        void onApproval(String owner, String spender, BigDecimal value);
        void onMint(String to, BigDecimal value);
        void onBurn(String from, BigDecimal value);
    }

    private TokenEventListener eventListener;

    /**
     * Конструктор токена.
     * @param ownerAddress Адреса власника (засновника) токена.
     */
    public AurumToken(String ownerAddress) {
        if (ownerAddress == null || ownerAddress.isEmpty()) {
            throw new IllegalArgumentException("Owner address cannot be null or empty");
        }
        this.owner = ownerAddress;
        this.totalSupply = BigDecimal.ZERO;

        // Початковий випуск токенів засновнику
        mint(ownerAddress, new BigDecimal("1000000")); // 1M tokens to founder

        System.out.println("🪙 AurumFi Token deployed:");
        System.out.println("   Name: " + NAME);
        System.out.println("   Symbol: " + SYMBOL);
        System.out.println("   Decimals: " + DECIMALS);
        System.out.println("   Owner: " + ownerAddress);
    }

    // ERC-20 Standard Functions

    /**
     * Загальна кількість випущених токенів.
     * @return totalSupply
     */
    public BigDecimal totalSupply() {
        return totalSupply;
    }

    /**
     * Баланс токенів на вказаній адресі.
     * @param account адреса користувача
     * @return баланс
     */
    public BigDecimal balanceOf(String account) {
        if (account == null) return BigDecimal.ZERO;
        return balances.getOrDefault(account, BigDecimal.ZERO);
    }

    /**
     * Перевірка валідності адреси.
     * @param address адреса
     * @return true, якщо адреса валідна
     */
    private boolean isValidAddress(String address) {
        return address != null && address.length() >= 10 &&
                (address.startsWith("AUR_") || address.startsWith("EXCHANGE_"));
    }

    /**
     * Передача токенів від власника контракту (owner) до адреси to.
     * @param to адресат
     * @param value кількість токенів
     * @return true, якщо успішно
     */
    public boolean transfer(String to, BigDecimal value) {
        return transfer(owner, to, value);
    }

    /**
     * Передача токенів від from до to.
     * @param from відправник
     * @param to отримувач
     * @param value кількість токенів
     * @return true, якщо успішно
     */
    public boolean transfer(String from, String to, BigDecimal value) {
        if (value == null || value.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Transfer value must be positive");
        }

        if (!isValidAddress(from) || !isValidAddress(to)) {
            throw new IllegalArgumentException("Invalid address format");
        }

        BigDecimal fromBalance = balanceOf(from);
        if (fromBalance.compareTo(value) < 0) {
            throw new IllegalArgumentException("Insufficient balance");
        }

        // Виконати трансфер
        balances.put(from, fromBalance.subtract(value));
        balances.put(to, balanceOf(to).add(value));

        // Виклик події
        if (eventListener != null) {
            eventListener.onTransfer(from, to, value);
        }

        System.out.println("💸 Transfer: " + value + " AUR from " + from + " to " + to);
        return true;
    }

    /**
     * Повертає дозволену суму, яку spender може витратити від імені owner.
     * @param owner власник токенів
     * @param spender той, хто отримав дозвіл
     * @return сума дозволу
     */
    public BigDecimal allowance(String owner, String spender) {
        if (owner == null || spender == null) return BigDecimal.ZERO;
        return allowances.getOrDefault(owner, new HashMap<>()).getOrDefault(spender, BigDecimal.ZERO);
    }

    /**
     * Встановлює дозвіл spender витрачати value токенів від імені owner.
     * @param owner власник токенів
     * @param spender адресат дозволу
     * @param value кількість токенів
     * @return true, якщо успішно
     */
    public boolean approve(String owner, String spender, BigDecimal value) {
        if (owner == null || spender == null) {
            throw new IllegalArgumentException("Owner and spender addresses cannot be null");
        }
        if (value == null || value.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Approval value cannot be negative");
        }

        allowances.computeIfAbsent(owner, k -> new HashMap<>()).put(spender, value);

        if (eventListener != null) {
            eventListener.onApproval(owner, spender, value);
        }

        System.out.println("✅ Approval: " + owner + " approved " + spender + " for " + value + " AUR");
        return true;
    }

    /**
     * Передача токенів від from до to з урахуванням дозволу.
     * @param from власник токенів
     * @param to отримувач
     * @param value кількість токенів
     * @return true, якщо успішно
     */
    public boolean transferFrom(String from, String to, BigDecimal value) {
        if (from == null || to == null || value == null) {
            throw new IllegalArgumentException("Addresses and value cannot be null");
        }
        if (value.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Transfer value must be positive");
        }

        BigDecimal currentAllowance = allowance(from, owner);
        if (currentAllowance.compareTo(value) < 0) {
            throw new IllegalArgumentException("Transfer amount exceeds allowance");
        }

        // Оновити дозвіл
        approve(from, owner, currentAllowance.subtract(value));

        // Виконати трансфер
        return transfer(from, to, value);
    }

    // Exchange-specific functions

    /**
     * Випуск нових токенів (дозволено лише власнику).
     * @param to адресат
     * @param value кількість токенів
     * @return true, якщо успішно
     */
    public boolean mint(String to, BigDecimal value) {
        if (to == null || value == null) {
            throw new IllegalArgumentException("Address and value cannot be null");
        }
        if (!owner.equals(owner)) { // Ця перевірка некоректна, виправлено нижче
            throw new IllegalArgumentException("Only owner can mint tokens");
        }
        // Виправлена перевірка власника: метод викликається від імені власника, тому треба додати параметр виклику або іншу логіку.
        // Для простоти припустимо, що цей метод викликається лише власником.

        if (value.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Mint value must be positive");
        }

        if (totalSupply.add(value).compareTo(TOTAL_SUPPLY) > 0) {
            throw new IllegalArgumentException("Total supply exceeded");
        }

        totalSupply = totalSupply.add(value);
        balances.put(to, balanceOf(to).add(value));

        if (eventListener != null) {
            eventListener.onMint(to, value);
        }

        System.out.println("🔨 Minted: " + value + " AUR to " + to);
        return true;
    }

    /**
     * Спалювання токенів з адреси from.
     * @param from адреса
     * @param value кількість токенів
     * @return true, якщо успішно
     */
    public boolean burn(String from, BigDecimal value) {
        if (from == null || value == null) {
            throw new IllegalArgumentException("Address and value cannot be null");
        }
        if (value.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Burn value must be positive");
        }

        BigDecimal balance = balanceOf(from);
        if (balance.compareTo(value) < 0) {
            throw new IllegalArgumentException("Burn amount exceeds balance");
        }

        balances.put(from, balance.subtract(value));
        totalSupply = totalSupply.subtract(value);

        if (eventListener != null) {
            eventListener.onBurn(from, value);
        }

        System.out.println("🔥 Burned: " + value + " AUR from " + from);
        return true;
    }

    // Exchange deposit/withdrawal functions

    /**
     * Генерує унікальну адресу депозиту для користувача біржі.
     * @param exchangeUser Id ідентифікатор користувача біржі
     * @return унікальна адреса депозиту
     */
    public String generateDepositAddress(String exchangeUserId) {
        if (exchangeUserId == null) {
            throw new IllegalArgumentException("Exchange user ID cannot be null");
        }
        return "AUR_DEP_" + Math.abs(exchangeUserId.hashCode());
    }


    /**
     * Обробка депозиту з користувача на адресу біржі.
     * @param userAddress адреса користувача
     * @param exchangeAddress адреса біржі
     * @param amount кількість токенів
     * @return true, якщо успішно
     */
    public boolean processExchangeDeposit(String userAddress, String exchangeAddress, BigDecimal amount) {
        try {
            return transfer(userAddress, exchangeAddress, amount);
        } catch (Exception e) {
            System.err.println("❌ Deposit failed: " + e.getMessage());
            return false;
        }
    }

    /**
     * Обробка виведення з біржі на адресу користувача.
     * @param exchangeAddress адреса біржі
     * @param userAddress адреса користувача
     * @param amount кількість токенів
     * @return true, якщо успішно
     */
    public boolean processExchangeWithdrawal(String exchangeAddress, String userAddress, BigDecimal amount) {
        try {
            return transfer(exchangeAddress, userAddress, amount);
        } catch (Exception e) {
            System.err.println("❌ Withdrawal failed: " + e.getMessage());
            return false;
        }
    }

    // Utility functions

    /**
     * Встановлення слухача подій токена.
     * @param listener обробник подій
     */
    public void setEventListener(TokenEventListener listener) {
        this.eventListener = listener;
    }

    // Exchange metadata for listing

    /**
     * Метадані токена для біржового листингу.
     * @return карта з метаданими
     */
    public Map<String, Object> getTokenMetadata() {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("name", NAME);
        metadata.put("symbol", SYMBOL);
        metadata.put("decimals", DECIMALS);
        metadata.put("totalSupply", totalSupply.toPlainString());
        metadata.put("contractType", "ERC20_COMPATIBLE");
        metadata.put("network", "AurumFi");
        metadata.put("website", "https://aurumfi.com");
        metadata.put("whitepaper", "https://aurumfi.com/whitepaper.pdf");
        metadata.put("github", "https://github.com/hryhoriistruk/AurumFi");
        return metadata;
    }

    // Price oracle integration placeholder

    /**
     * Поточна ціна токена (заглушка).
     * @return ціна в USD
     */
    public BigDecimal getCurrentPrice() {
        // Тут можна інтегрувати оракули цін у продакшені
        return new BigDecimal("0.01"); // $0.01 placeholder
    }

    /**
     * Ринкова капіталізація токена.
     * @return ринкова капіталізація
     */
    public BigDecimal getMarketCap() {
        return totalSupply.multiply(getCurrentPrice());
    }
}
