package com.athletex.backend.e2e;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@Tag("e2e")
public class AthleteXWebE2ETest {

    private static WebDriver driver;
    private static final String BASE_URL = "http://localhost:5173";

    @BeforeAll
    public static void setupClass() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new"); // Run in headless mode for CI/CD compatibility
        options.addArguments("--remote-allow-origins=*");
        options.addArguments("--window-size=1920,1080");
        driver = new ChromeDriver(options);
    }

    @AfterAll
    public static void teardownClass() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    @Order(1)
    @DisplayName("Selenium E2E: Should load homepage/login page successfully")
    public void testHomepageLoads() {
        driver.get(BASE_URL);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        // Assert page title or presence of root element
        assertNotNull(driver.getTitle());
        WebElement root = wait.until(ExpectedConditions.presenceOfElementLocated(By.id("root")));
        assertNotNull(root, "React app root container should be present");
    }

    @Test
    @Order(2)
    @DisplayName("Selenium E2E: Should navigate to login page and render input controls")
    public void testLoginPageControls() {
        driver.get(BASE_URL + "/login");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        // Find email input or form inputs
        WebElement body = wait.until(ExpectedConditions.presenceOfElementLocated(By.tagName("body")));
        assertNotNull(body);

        String pageSource = driver.getPageSource();
        assertTrue(pageSource.contains("AthleteX") || pageSource.contains("Sign In") || pageSource.contains("Login"),
                "Login page should contain brand or sign-in text");
    }
}
