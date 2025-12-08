#!/usr/bin/env python3
"""
Script to create VCF file for scheduled and rejected contacts with Rej_ prefix.
"""

import re

def normalize_phone(phone):
    """Normalize phone number to standard format."""
    # Remove all spaces, dashes, and parentheses
    phone = re.sub(r'[\s\-\(\)]', '', str(phone))
    
    # Remove quotes if present
    phone = phone.strip('"\'')
    
    # If it starts with +251, keep it
    if phone.startswith('+251'):
        return phone
    # If it starts with 251 (without +), add +
    elif phone.startswith('251'):
        return '+' + phone
    # If it's a 9-digit number starting with 0, replace 0 with +251
    elif phone.startswith('0') and len(phone) == 10:
        return '+251' + phone[1:]
    # If it's a 9-digit number without leading 0, add +251
    elif len(phone) == 9 and phone.isdigit():
        return '+251' + phone
    # If it's a 12-digit number (251 + 9 digits), add +
    elif len(phone) == 12 and phone.startswith('251'):
        return '+' + phone
    # Otherwise, try to add +251 if it looks like a local number
    elif len(phone) >= 9:
        # If it doesn't start with +, assume it's local and add +251
        if not phone.startswith('+'):
            # Remove leading 0 if present
            if phone.startswith('0'):
                phone = phone[1:]
            return '+251' + phone
    
    return phone

def create_vcf_entry(name, phone):
    """Create a VCF entry for a contact."""
    # Clean up name (remove quotes, extra whitespace)
    name = name.strip().strip('"\'')
    # Replace newlines in name with spaces
    name = re.sub(r'\s+', ' ', name)
    
    # Add Rej_ prefix
    name = f"Rej_{name}"
    
    # Normalize phone
    phone = normalize_phone(phone)
    
    # Create VCF entry
    vcf = f"""BEGIN:VCARD
VERSION:3.0
FN:{name}
TEL;TYPE=CELL:{phone}
END:VCARD
"""
    return vcf

# The data provided by the user
data = """Nanat yosef|0954839901|completed|
Sifen Asrat|0923939080|completed|
Haleluya degamlak|0939961945|completed|
ሙሉቀን አበራ|0980003084|completed|
Eyosiyas Abebe|927171232|completed|
Evana shiferaw|0948697720|scheduled|
ስጦታ ተስፋዬ|0960065641|completed|
Maranata Tesfu|0919366162|completed|
Yeabsitota Aleka|0980348280|no_show|rejected
Bereket teshale|0943656575|completed|
Meheret Alemayehu|0984147284|completed|
Natnael Arega|+251943790597|completed|
ተካልኝ ይስሐቅ|0978396429|scheduled|
ሔርሜላ ደሴ አሻግሬ|0953387408|no_show|rejected
Frebel Berhanu Eketa|+251 992835539|no_show|rejected
Samrawit jemal|0940172796|completed|
Ruhama Wondwosen|0985152699|no_show|rejected
Natnael hailu|0913107650|completed|
Eyerusalem Asfaw|0900880273|completed|
Yishak melaku welde|0978407509|no_show|rejected
ፍቅር ሳህሉ|0986247202|scheduled|
ወርቅታዊት አለሙ|+251925685131|completed|
ሀና ሚካኤል|0926643884|no_show|rejected
Menan Ebuma|0972065859|completed|
Evana shiferaw|0948697720|scheduled|
Abenezer Seifu Desta|+251921379906|completed|
ሮቤል ደሣለኝ|0961003588|no_show|rejected
Eyerusalem Birhanu|0938654433|completed|
Mihret Molla|+251939439568|no_show|rejected
Fenet Tesfaye|0962465884|scheduled|
Abenezer Tesfaye|0973033001|completed|
Natinael yosef|0939559185|completed|
Abigya Abebe|0906325645|scheduled|
Betselot Alemu|0910781284|completed|
ሩት ብርሃኑ ሱሞሮ|0968496250|no_show|rejected
Misrak Detamo|0904825550|no_show|rejected
Eyasu Demeke|979564849|completed|
Selam Meseret|0906625517|completed|
እያሱ ዘመዴ አኒቶ|0933158650|scheduled|
Ashenafi asfaw|0905313140|completed|
እየሩሳሌም መስፍን በየነ|0976254750|scheduled|
Eiyas Alemayehu|0987227416|completed|
Eden Abreham|0967711852|completed|
Yamlaksra zeleke yirga|0937205032|completed|
meklit sintayehu|0907879926|no_show|rejected
Beamlak tilahun|0713537484|no_show|rejected
Christian Sawo|0953440667|completed|
Immanuel Samson|0966789969|scheduled|
Eden Berecha|+251 92 100 1333|no_show|rejected
Abigia petros woldemariam|0913435524|completed|
Nathan abdissa|0943138511|completed|
Miracle Arega
ሚራክል አረጋ|0972117480|no_show|rejected
My Name is Dawit Eshetu|0937703529|scheduled|
Abraham Seyoum|0921357126|completed|
ቃልኪዳን ንጉሱ|0911976330|no_show|rejected
Feven Tilahun|0900872431|scheduled|
Eleni hailu|+251921789381|completed|
Eyob ketema|0920706061|no_show|rejected
Kirubel tesfaye|954926356|no_show|rejected
Henok Niggusie|0913070111|completed|
Mihiret Elias|0946628738|completed|
Abib Zewdu|0954993493|completed|
Kaleb Erko|0983724017|completed|
Biniyam Edeglign|0967421338|no_show|rejected
Bezawit Tesfahun|0943303670|completed|
አልአዛር ታደለ|0930904660|completed|
Kalkidan Berhanu|0927960879|no_show|rejected
ዮሴፍ ጃኖ ሶዞ|0920193686|completed|
Simret Kidanu|0937643947|no_show|rejected
Amen Temesgen|0942472900|no_show|rejected
Natnael Abel|0986236616|completed|
Firehiwot Daba|0920022929|completed|
Eyuel Mamushet|0989522359|completed|
Tigist Tola|0924069066|completed|
ምናሴ ፍርዳአወቅ|0966974706|completed|
Kalkidan teshale|0954294689|scheduled|
Etsegenet asefa kasshun|0911689672|no_show|rejected
Kaleab Ayele Getachew|0911966154|completed|
Shalom Degu|0943720259|no_show|rejected
Tamiru Mikeal|0948769903|no_show|rejected
Ruth Wesenu Asfaw|0955474870|completed|
ውብእድል ታደሰ|0902882631|scheduled|
Lidya Asfaw|0904544617|completed|
EYAEL GEBEYEHU|+251925267469|scheduled|
Lidiya yiberta|991329245|completed|
ናትናኤል ሶፎንያስ|0993518365|no_show|rejected
Kidus mesay|0975831113|scheduled|
Selome Desta|0968237522|no_show|rejected
Sara teferi tegegn|0980188876|completed|
Bamlak kena moges|0975109489|completed|
Zebiba kelil|0901737693|completed|
ቦንቱ አድነው|0938024204|no_show|rejected
Bereket eyob|0986042599|scheduled|
Rehbote Alemayhu Nemo|0968616562|completed|
Yeabsira Ashenafi|0955107450|completed|
Ruth Adane|0905748034|completed|
ሌዊ ብርሃኑ ባልቻ|0986697846|scheduled|
Lidiya abrham|0939484817|completed|
Ruhama  chemeda|0960771407|no_show|rejected
Tihani mohammed|0975309987|scheduled|
Abraham Alemu|0922085310|completed|
Deborah Dessalegn|0917249715|scheduled|
Samuel Wondmu|251947482086|scheduled|
ታምራት ተስፋዬ መኮንን|0980187275|completed|
Minase Addisu|0985427328|scheduled|
Tsebaot Dendir|0933665454|completed|
Dibora shiferaw|0940664750|completed|
Mihret Samuel|0901223963|scheduled|
Eyerusalem Alemu|0928280728|completed|
Raey Dereje|0900648254|no_show|rejected
Abigail Solomon|0972823463|no_show|rejected
Eyerusalem sisay|0931531463|completed|
ZEREYAEKOB DAWIT WELDETSADIK|0986989734|no_show|rejected
Netsanet fikadu|0949447544|scheduled|
አቤኔዘር ብርሀኑ ደምሴ|0994427815|completed|
ተስማምቻለሁ|0951200048|completed|
Ribka zerihun habte|942149149|scheduled|
ህልዳና ወንጌል|0950385715|no_show|rejected
Abigia yesuf Ali|0922575526|no_show|rejected
Letu samuel|0987275989|no_show|rejected
Samuel Tariku|931153720|no_show|rejected
Abenezer Meweded|+251993501018|completed|
Befekadu Bergena Ashine|0915969559|completed|
Betelhem yare|0970642282|completed|
Bezawit Baharu|0972350244|scheduled|
Hermela Mengistab|0984792487|no_show|rejected
Tesfa Ahmed kedir|0964044572|completed|
Beimnet sisay tolosa|0988435925|completed|
Temesgen tesfaye|0972021068|completed|
Wakgari Damesu Demissie|+251913813933|scheduled|
Amanuel walelgn|0904667478|no_show|rejected
Tsihon getahun|0900891979|scheduled|
lidiya tsega|0940791510|no_show|rejected
ጥበብ ዳኛቸው|988745060|completed|
ሐና መስፍን|0989011842|scheduled|
Mihret zeleke|0967007410|scheduled|
Tesfaye gemechu daniel|0912207447|scheduled|
Natinal abebe|0939311720|no_show|rejected
መሰረት ዘርፉ ደገፉ|0987071548|no_show|rejected
Amanuel kumlachew|0961666463|no_show|rejected
Peniel Alemayehu|251942538916|completed|
Mintesnot Demelash|0936436758|completed|
Kidist mengistu|095339865|no_show|rejected
Shalom Mohammed|982453869|completed|
Abenezer Diriba|0976420406|no_show|rejected
Sisay jemaenh|0928980381|no_show|rejected
Helina tesfaye ayele|25153443619|no_show|rejected
Maedot teketsel|0964034610|completed|
Amanuel alemayehu ketero|0910518876|completed|
Elily Solomon Benti|0929364887|completed|
ፀጋ ደመላሽ
Tsega Demelash|+251909602292|scheduled|
Ruth Solomon Abe|0934086992|completed|
Tinsae waja|0942740001|scheduled|
Efrata Teketsel|0955931714|completed|
Nigussie Haileyesus Geremamo|0916435699|no_show|rejected
ሊዲያ ግርማ|0975943784|completed|
Biruktawit Alemu|0939363402|completed|
Isayas legesse|0908220838|completed|
Christina Muluken|+251942161447|scheduled|
መስቀልክብሯ ደሜ|911160596|completed|
Mahlet Mussie|0974314120|no_show|rejected
አቤኔዘር መቻል|0988994210|completed|
ፌቨን  ክንፈ|0910980920|no_show|rejected
አመሰግናለው ቤተልሔም ታደሰ|0964553066|scheduled|
Misganaye Amare Dereje|+251911598384|completed|
nardos mesele|0902479926|scheduled|
Bethlehem kifle|0963573438|no_show|rejected
ኤዴን ጋሉንዴ ዋኬታ|0925723512|scheduled|
METI YOHANNES YIGEZU|0917847144|scheduled|
HEMEN HAILU|0951525865|no_show|rejected
ናታኒም ሙላቱ|0977022908|no_show|rejected
Dr. Beamlak Tamene Gemeda|0965656845|completed|
Haileyesus Kebede Gole|0916645124|completed|
Betelhem endale|0934269599|completed|
Tselot Sisay|0916216116|no_show|rejected
Tinsae Alemu|0910996558|no_show|rejected
Zelalem habteyes
ዘላለም ሀብተየስ|0989643311|scheduled|
Netsanet Abebe Negash|0911542292|completed|
Tizita Saol Wodajo|0902902081|completed|
አቢጌል ቱሉ|0992629785|completed|
SHIFERAW TESFAYE GEBREYES|913642461|scheduled|
Bereket sisay|988240490|completed|
Fitsum Mesfin|0974259236|scheduled|
Yishak zerihun|0942394809|scheduled|
Yordanos Bergude|0926574995|scheduled|
Eyasu kebede Gemechu|0917651880|completed|
Ruth Tasew|0904436853|scheduled|
Salem Gebru|0951067951|scheduled|
Hallelujah Girma|0944227821|completed|
Bemnet dagim|0951234965|no_show|rejected
Markos bezabih|0925903807|completed|
Lidiya wondimu|969445497|completed|
Mhiret kefetew|0968143309|completed|
Joshua Gebeyehu|0992740397|completed|
Nebiyu Mulatu Alemu|+251977045056|scheduled|
Lidiya Abayneh|0941384821|completed|
Ermias haile|0940461628|completed|
Christian Demelash|0934274195|no_show|rejected
Ribika Wondimu|982487576|completed|
Betelehem Eyasu 
Ebalalw|0966670834|completed|
Ermiyas samson legese|+251979683535|completed|
Amanuel Zemedu|0936790050|no_show|rejected
ሳራ በለጠ|0987096128|scheduled|
ናሆም አካሉ|0967829185|no_show|rejected
Naol Kuma Edessa|0938896759|completed|
ቴዎድሮስ በቀለ|0933335066|completed|
Tsion Desalegn|0972332873|completed|
ይታዘብ ማርቆስ|0925100041|completed|
Tsion Ketema|0980491996|no_show|rejected
Behailu Dejene|0912639783|no_show|rejected
Fenet fasil birhanu 
ፌኔት ፋሲል ብርሀኑ|0917450348|no_show|rejected
ፀጋ ጥሩነህ|0983419898|completed|
Bereket dereje|0955866374|no_show|rejected
Mikiyas Tadesse Godeto|0713079662|completed|
ኤደን ሰለሞን|0934234973|completed|
Eden Deres|+251 928 683 721|completed|
Bethelhem Hailu Zeberga|0704506242|no_show|rejected
Ruhama Shewadaru|0989106229|no_show|rejected
አዲስኪዳን ንጉሴ|0932321012|no_show|rejected
Meron Ayele Aba|0983962544|scheduled|
Kertina Tesfahungn|0955400793|no_show|rejected
Barnabas Wondmnow|+251945587622|no_show|rejected
Betiel Tilaye|0975586852|completed|
Feven Tilahun Abera|919342702|completed|
Bezawit yohannes|0919118419|no_show|rejected
medhin wakijra|0989822046|no_show|rejected
ልዑልሰገድ ከበደ ወ/ሰንበት|0935107902|completed|
lidiya kidane abune|0941270020|scheduled|
Lensa Tarekegn|0934872673|no_show|rejected
Hillary Melaku|0985084256|completed|
Natnael wondmnow|0963153359|scheduled|
Ephrem Kussiya|0933708983|scheduled|
Kidist dawit|0953752424|no_show|rejected
Frehiwot tadesse Ali|0952448402|no_show|rejected
Bereket Sete Abebe|+251640926333|completed|
Yared Damtew|0947696420|completed|
Etagegnehu Tesfaye Mekonnen|0988670909|completed|
Yabets wendimu|0936070100|completed|
Jalele genene|0942104372|no_show|rejected
Lidia Tamirat|+251964904958|no_show|rejected
አክሳን ቴዎፍሎስ|0994157576|no_show|rejected
Liya Teshome|0973105050|completed|
Sosina yirga|0927144478|completed|
Yohannes Abayneh|0930763136|no_show|rejected
Robel  Getahun Bolol|0923025686|no_show|rejected
Deborah Petros Woldesenbet|964544725|no_show|rejected
Rediet Atlabachew Kasa|+251947850106|no_show|rejected
Melewot Wolde|0921100952|no_show|rejected
Yesu Daniel Selato|0980115980|no_show|rejected
Belete Ermias|0985690315|scheduled|
Firaol Abiyot sintayehu|0911258306|completed|
Abenezer Aruse|993017547|completed|
Dagim yohanis|+251979937521|scheduled|
ነብዩ ሀብታሙ|0953915745|scheduled|
Wengel Mesfin Derash|0934446953|scheduled|
Tsionawit Geremew|251936983907|no_show|rejected
Biftu Mesfin Asfaw|0934831808|scheduled|
eyaiel bekele|0965267260|completed|
Zekiyos bezabih|0960831732|completed|
Yeabtsega Aderaw Gelaw|0923065482|completed|
በረከት ሳምሶን|0953215602|scheduled|
Dursitu Zeleke Lanto|0922228892|scheduled|
Milkyas Tesfom|0932347951|completed|
Ruth Zekarias Beyene|+251912004851|scheduled|
ኤፍራታ መንግስቱ|0932013718|completed|
Eyob Fikru|+251989352434|completed|
Abenezer Mekonnen|0909322318|no_show|rejected
Tsion mesfin|0923967320|completed|
Rohobot Abebe|+251941493696|scheduled|
Kalkidan Gezahegne|0973883850|no_show|rejected
Eyerusalem solomon|0941279490|no_show|rejected
sofonias melkamu|0937940709|no_show|rejected
Mary Mekonnen|0926967889|no_show|rejected
Shalom Mohammed|0909979508|no_show|rejected
Metsnanat yohannes|0903075771|scheduled|
Henok Sebsibe|0705116166|scheduled|
Metsnanat abebe megersa|930800361|completed|
Nahom Kidane Guta|+251948275900|no_show|rejected
Sisay Birhanu|0948217584|scheduled|
ኤደን መስፍን|0969935139|no_show|rejected
ዲቦራ መልካ ሹሚ|+251925625260|completed|
Ruhama ayele|0985372873|no_show|rejected
Samuel Berhanu|967768875|no_show|rejected
Kirube Afework fanata|0908619856|no_show|rejected
Rediet Feleke Maru|0929909810|completed|
Abinet Adane|0938575639|no_show|rejected
Bitanya workneh|927006583|no_show|rejected
Mihret Mulugeta|0902323375|no_show|rejected
Mihret amare|0964506767|completed|
Natnael teshome|0994410027|completed|
የሩቅምስራቅ ብርሃን|0940191042|no_show|rejected
Feven reta|+251948189622|no_show|rejected
Natnael Mandefro Tadesse|0920734582|completed|
Mihiretu Tsegaye Hailu|0937660359|no_show|rejected
Elroie Ezra|+251 99 126 2449|no_show|rejected
Lidiya Adelo|0921215194|completed|
Maranatha Getachew|0925506412|completed|
Tsegab abebe|0942438415|no_show|rejected
ዮሴፍ ዮሐንስ መና|0929553297|completed|
Meaza Mena Teka|0936625240|scheduled|
Debi Fufa Terfa|0942093983|completed|
Dibora Abrham|0940049721|completed|
Kalalew Terefe
ቃልአለው ተረፈ|0944430222|completed|
Seratu Haile|0939264358|scheduled|
Kaleb sileshi|0994211848|no_show|rejected
Mehiret mulugeta haylemaryam|0991331907|no_show|rejected
አዲሱ መብራቱ|0913622304|no_show|rejected
Leul desyibelew|0966954756|no_show|rejected
Meheret Tarekegn Mekonnen|+251970348766|no_show|rejected
Bereket Derbe|0953867635|no_show|rejected
dawit yared|0933770902|completed|
Hawi jembere|0921736401|no_show|rejected
Surafel dawit tariku|0935651165|completed|
Bamlak Melkamu|0962080050|scheduled|
Meklit Tilahun Chernet|0923757685|completed|
Jerusalem Tirfe|0910681906|completed|
Zedagim Zebdewos Eka|0928119968|no_show|rejected
ቤተልሔም አብርሃም|0973624818|no_show|rejected
Hana ashenafi|0985468848|completed|
Tumim Ashebir|0930307031|no_show|rejected
ፅዮን ይልማ|0937910576|no_show|rejected
Elsabeth Wedu|0929048406|no_show|rejected
Feben Mesfin|0924370071|completed|
Dibora Daniel Galore|0934123890|completed|
Musie Achalu|0913521338|scheduled|
ሰላም ይንገስ|0988141912|scheduled|
ራሔል ሞገስ|0989911602|no_show|rejected
Tihun Dana|0973495086|completed|
Kalkidan Niguse|0941509781|no_show|rejected
Bilen Kassahun Birara|+251 986358998|no_show|rejected
Israel getachew|0964626361|completed|
YOSEPH ESHETU BEDASSA|0922964946|completed|
Endalkachew Desta|0984548178|no_show|rejected
Fiker Asfaw G/sillassie|0954679358|no_show|rejected
እስከዳር አስቻለው|0974798867|no_show|rejected
Dinksra Asmamaw|0951021441|scheduled|
Rediet Asmamaw|+251973325111|scheduled|
abenezer yohannes|0932278902|no_show|rejected
Yididiya Wondmagegn|0900619929|completed|
Tinsae Tirfe|0974434285|no_show|rejected
Dibora Fitsumbrhan Alem|0953163093|scheduled|
Samuel Tesfaye Gebreweld|0915790404|completed|
Rodas teshome mulugeta|0972200936|completed|
Yonatan Teferi Yimer|0979076748|no_show|rejected
Jerry Getachew|0916518211|no_show|rejected
Leul Abera|0943366036|no_show|rejected
Eden Gesamo Geta|0927754453|no_show|rejected
አቢሲኒያ ጀሚል|0941042391|no_show|rejected
መ|0953504161|completed|
Dibora tadele|0987230639|scheduled|
Betelehem Samuel|0904625292|scheduled|
ሣሮን ንጉሴ|0943005342|scheduled|
Eshkol wondwossen|+251949868989|completed|
Yonatan Teferi Yimer|0979076748|scheduled|
Jitu Dejene Negassa|0919895413|completed|
Bemnet Ashagre|0940205434|completed|
Mihiret mulugeta|0921236417|scheduled|
NETSANET TESFAYE GIZAW|251980159501|no_show|rejected
Helina Tadesse|0911689998|completed|"""

def main():
    output_file = 'rejected_only_contact.vcf'
    rejected_contacts = []
    
    # Parse the data - handle multiline entries
    lines = data.strip().split('\n')
    i = 0
    current_name_parts = []
    
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        
        # Check if line contains pipe delimiters
        if '|' in line:
            parts = [p.strip() for p in line.split('|')]
            if len(parts) >= 2:
                name_part = parts[0]
                phone = parts[1]
                status = parts[2] if len(parts) > 2 else ''
                final_decision = parts[3] if len(parts) > 3 else ''
                
                # Combine with any previous name parts
                if current_name_parts:
                    name = ' '.join(current_name_parts) + ' ' + name_part
                    current_name_parts = []
                else:
                    name = name_part
                
                # Check if final_decision is "rejected" (must be in the final_decision field)
                final_decision_lower = final_decision.lower()
                if phone and final_decision_lower == 'rejected':
                    rejected_contacts.append((name, phone))
        else:
            # Line without pipe - continuation of name
            current_name_parts.append(line)
        
        i += 1
    
    # Remove duplicates based on phone number
    seen_phones = set()
    unique_rejected = []
    for name, phone in rejected_contacts:
        norm_phone = normalize_phone(phone)
        if norm_phone and norm_phone not in seen_phones:
            seen_phones.add(norm_phone)
            unique_rejected.append((name, phone))
    
    print(f"Found {len(unique_rejected)} contacts with final_decision='rejected'")
    
    # Create VCF file
    with open(output_file, 'w', encoding='utf-8') as vcf_file:
        for name, phone in unique_rejected:
            vcf_entry = create_vcf_entry(name, phone)
            vcf_file.write(vcf_entry)
    
    print(f"✅ Created {output_file} with {len(unique_rejected)} contacts")

if __name__ == '__main__':
    main()
