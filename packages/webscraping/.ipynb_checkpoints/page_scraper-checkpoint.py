from selenium import webdriver
from selenium.webdriver.common.by import By
import time

driver = webdriver.Chrome()
driver.get('https://council.nola.gov/home/')

time.sleep(2)
#<tr class="listingRow"> is row in table
# xpath: //*[@id="archive"]/tbody/tr[1]


# iframe path: //*[@id="zone-content"]/section[5]/div/div/div/div/iframe
driver.switch_to.frame(driver.find_element(By.XPATH, "//*[@id='zone-content']/section[5]/div/div/div/div/iframe"))
rows = driver.find_elements(By.CLASS_NAME, 'listingRow')
for i in rows:
    print(i.get_attribute('innerHTML'))
    print("***")
    video_rows = i.find_elements(By.XPATH, ".//*")
    for v in video_rows:
        print(v.get_attribute('innerHTML'))
        print("-------------------")
    exit()


driver.quit()