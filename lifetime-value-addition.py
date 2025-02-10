import requests
import json
import pandas as pd
import time
import csv

def load_config(file_path):
    with open(file_path, 'r') as f:
        config = json.load(f)
    return config

def refresh():
    config_file_path = 'config.json'
    config = load_config(config_file_path)
    return config["access_token"]

def get_locationId():
    config_file_path = 'config.json'
    config = load_config(config_file_path)
    file_locationId = config["locationId"]
    return file_locationId

def contact_details(contact_id):
    ath_token = refresh()
    url = f"https://services.leadconnectorhq.com/contacts/{contact_id}"
    headers = {
        "Authorization": f"Bearer {ath_token}",
        "Version": "2021-07-28",
        "Accept": "application/json"
    }
    while True:
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            time.sleep(0.1)
            if response.ok:
                #print('OTP Field Updated')
                return response
            else:
                print(f"Error: {response.status_code} - {response.text}")
                break
        except ConnectionError:
            print("Error: Unable to establish a connection. Please check your internet connection.")
            time.sleep(300)
        except requests.exceptions.HTTPError as e:
            print(f"Error: {e}")
            time.sleep(300)
            refresh()
        except requests.exceptions.ConnectTimeout as e:
            print(f"Error: {e}")
            time.sleep(300)
        except RequestException as e:
            print(f"Error: {e}")
            break


def update_lifetime_value(contact_id, updated_value):
    ath_token = refresh()
    existing_results = contact_details(contact_id).json()
    try:
        email_dnd = existing_results['contact']['dndSettings']['Email']['status']
    except KeyError:
        email_dnd = "inactive"
    try:
        contact_phone = existing_results['contact']['phone']
    except KeyError:
        contact_phone = None
    try:
        contact_address1 = existing_results['contact']['address1']
    except KeyError:
        contact_address1 = None
    try:
        contact_city = existing_results['contact']['city']
    except KeyError:
        contact_city = None
    try:
        contact_state = existing_results['contact']['state']
    except KeyError:
        contact_state = None
    try:
        contact_postalCode = existing_results['contact']['postalCode']
    except KeyError:
        contact_postalCode = None
    try:
        contact_source = existing_results['contact']['source']
    except KeyError:
        contact_source = None
    try:
        contact_country = existing_results['contact']['country']
    except KeyError:
        contact_country = None
    try:
        contact_name = existing_results['contact']['firstName']
    except KeyError:
        contact_name = None
    try:
        contact_last_name = existing_results['contact']['lastName']
    except KeyError:
        contact_last_name = None
    # Perform operations or actions based on the inputs
    url = f"https://services.leadconnectorhq.com/contacts/{contact_id}"
    payload = {
        "firstName": contact_name,
        "lastName": contact_last_name,
        "name": contact_name,
        "email": existing_results['contact']['email'],
        "phone": contact_phone,
        "address1": contact_address1,
        "city": contact_city,
        "state": contact_state,
        "postalCode": contact_postalCode,
        "website": None,
        "timezone": "America/NewYork",
        "dnd": False,
        "dndSettings": {
            "Call": {
                "status": "inactive",
                "message": "global_update",
                "code": "global_update"
            },
            "Email": {
                "status": email_dnd,
                "message": "global_update",
                "code": "global_update"
            },
            "SMS": {
                "status": "inactive",
                "message": "global_update",
                "code": "global_update"
            },
            "WhatsApp": {
                "status": "inactive",
                "message": "global_update",
                "code": "global_update"
            },
            "GMB": {
                "status": "inactive",
                "message": "global_update",
                "code": "global_update"
            },
            "FB": {
                "status": "inactive",
                "message": "global_update",
                "code": "global_update"
            }
        },
        "inboundDndSettings": { "all": {
                "status": "inactive",
                "message": "global_update"
            } },
        "tags": ["customer"],
        "customFields": [
            {
                "id": "wrSYIIh7XQ3GGJkdEs4z",
                "field_value": updated_value
            }
        ],
        "source": contact_source,
        "country": contact_country
    }
    json_str = json.dumps(payload)
    obj2 = json.loads(json_str)
    body = json.dumps(obj2, indent=4)
    headers = {
        "Authorization": f"Bearer {ath_token}",
        "Version": "2021-07-28",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    while True:
        try:
            response = requests.put(url, data=body, headers=headers)
            response.raise_for_status()
            time.sleep(0.1)
            if response.ok:
                return True
            else:
                print(f"Error: {response.status_code} - {response.text}")
                break
        except ConnectionError:
            print("Error: Unable to establish a connection. Please check your internet connection.")
            time.sleep(300)
        except requests.exceptions.HTTPError as e:
            time.sleep(300)
            refresh()
        except requests.exceptions.ConnectTimeout as e:
            print(f"Error: {e}")
            time.sleep(300)
        except RequestException as e:
            print(f"Error: {e}")
            break

def email_id_match(target_email):
    with open("ghl.csv", mode='r', encoding='utf-8') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            if row['Email'].strip().lower() == target_email.strip().lower():
                return row['Contact Id']
    return None

def get_custom_field_value(json_data, target_field_id):
    # Check if json_data has a 'contact' key
    if 'contact' in json_data:
        # Get the custom fields of the contact
        custom_fields = json_data['contact'].get('customFields', [])
        # Search through each custom field
        for field in custom_fields:
            if field.get('id') == target_field_id:
                return field.get('value')
    elif 'contacts' in json_data:
        # Iterate through all contacts
        for contact in json_data.get('contacts', []):
            # Check if contact has custom fields
            custom_fields = contact.get('customFields', [])
            # Search through each custom field
            for field in custom_fields:
                if field.get('id') == target_field_id:
                    return field.get('value')
    return None

def row_opperations(target_email, order_value):
    contact_id = email_id_match(target_email)
    if contact_id == None:
        return None
    print(target_email)
    target_id = "wrSYIIh7XQ3GGJkdEs4z"
    some_details = contact_details(contact_id).json()
    custom_value = get_custom_field_value(some_details, target_id)
    if custom_value is None:
        custom_value = 0
        updated_value = float(order_value) + float(custom_value)
    else:
        updated_value = float(order_value) + float(custom_value)
    status = update_lifetime_value(contact_id, updated_value)
    if status == True:
        return updated_value
    else:
        print(f"error {target_email} - {updated_value}")

def main():
    # Read CSV (automatically skips header)
    cols = ['Email (Billing)', 'Order Total Amount']
    df = pd.read_csv('p.csv', usecols=cols)
    for _, row in df.iterrows():
        result = row_opperations(row['Email (Billing)'], row['Order Total Amount'])

if __name__ == "__main__":
    main()
