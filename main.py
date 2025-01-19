from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options as ChromeOptions
from tempfile import mkdtemp

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def lambda_handler(event, context):
    chrome_options = ChromeOptions()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--disable-dev-tools")
    chrome_options.add_argument("--no-zygote")
    chrome_options.add_argument("--single-process")
    chrome_options.add_argument(f"--user-data-dir={mkdtemp()}")
    chrome_options.add_argument(f"--data-path={mkdtemp()}")
    chrome_options.add_argument(f"--disk-cache-dir={mkdtemp()}")
    chrome_options.add_argument("--remote-debugging-pipe")
    chrome_options.add_argument("--verbose")
    chrome_options.add_argument("--log-path=/tmp")
    
    # Ensure Chrome binary location points to the correct path
    chrome_options.binary_location = "/opt/chrome/chrome-linux64/chrome"

    # Service for ChromeDriver (make sure the path is correct)
    service = Service(executable_path="/opt/chrome-driver/chromedriver-linux64/chromedriver", service_log_path="/tmp/chromedriver.log")

    # Initialize the WebDriver
    driver = webdriver.Chrome(service=service, options=chrome_options)


    # Visit a webpage
    # driver.get("https://google.com")
    driver.get("https://www.whitepages.com/address/66-Oleander-Dr/Northport-NY")
    

    #Get the page title and return the response
    elements = WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.XPATH, "//div[@id='PropertyOwnerInfoSection']//a[starts-with(@href, '/name/')]"))
    )
    names = ",".join(elements)
 

    return {
        "statusCode": 200,
        "body": f"Successfully fetched names: {driver.title}"
    }
