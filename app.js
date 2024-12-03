// Elements
const providerSelect = document.getElementById('providerSelect');
const serviceTypeContainer = document.getElementById('serviceTypeContainer');
const serviceType = document.getElementById('serviceType');
const serviceOptionsContainer = document.getElementById('serviceOptionsContainer');
const storageOptions = document.getElementById('storageOptions');
const serverOptions = document.getElementById('serverOptions');
const databaseOptions = document.getElementById('databaseOptions');
const kubernetesOptions = document.getElementById('kubernetesOptions');
const loadBalancerOptions = document.getElementById('loadBalancerOptions');
const dnsOptions = document.getElementById('dnsOptions');
const vpcOptions = document.getElementById('vpcOptions');
const volumeOptions = document.getElementById('volume');
const selectedService = document.getElementById('selectedService');
const fetchPricingBtn = document.getElementById('fetchPricingBtn');

// Display Service Type dropdown after selecting provider
providerSelect.onchange = function () {
    if (providerSelect.value) {
        serviceTypeContainer.classList.remove('hidden');
    } else {
        serviceTypeContainer.classList.add('hidden');
    }
    selectedService.innerText = '';
    fetchPricingBtn.classList.add('hidden');
};

// Display specific service options based on selected service type
serviceType.onchange = function () {
    const type = serviceType.value;
    serviceOptionsContainer.classList.remove('hidden');
    storageOptions.classList.add('hidden');
    serverOptions.classList.add('hidden');
    databaseOptions.classList.add('hidden');
    kubernetesOptions.classList.add('hidden');
    loadBalancerOptions.classList.add('hidden');
    dnsOptions.classList.add('hidden');
    vpcOptions.classList.add('hidden');
    volumeOptions.classList.add('hidden');

    if (type === 'storage') {
        storageOptions.classList.remove('hidden');
    } else if (type === 'server') {
        serverOptions.classList.remove('hidden');
    } else if (type === 'database') {
        databaseOptions.classList.remove('hidden');
    } else if (type === 'kubernetes') {
        kubernetesOptions.classList.remove('hidden');
    } else if (type === 'dns') {
        dnsOptions.classList.remove('hidden');
    } else if (type === 'vpc') {
        vpcOptions.classList.remove('hidden');
    } else if (type === 'LoadBalancer') {
        loadBalancerOptions.classList.remove('hidden');
    } else if (type === 'volume') {
        volumeOptions.classList.remove('hidden');
    }
};

// Update selected service text and show fetch pricing button
const handleServiceSelection = (selectElement) => {
    const service = selectElement.value;
    selectedService.innerText = `Selected Service: ${service}`;
    fetchPricingBtn.classList.remove('hidden');
};

// Event listeners for specific service selections
document.getElementById('storageService').onchange = function () {
    handleServiceSelection(this);
};
document.getElementById('serverService').onchange = function () {
    handleServiceSelection(this);
};
document.getElementById('databaseService').onchange = function () {
    handleServiceSelection(this);
};
document.getElementById('kubernetesService').onchange = function () {
    handleServiceSelection(this);
};
document.getElementById('loadBalancerService').onchange = function () {
    handleServiceSelection(this);
};
document.getElementById('dnsService').onchange = function () {
    handleServiceSelection(this);
};
document.getElementById('vpcService').onchange = function () {
    handleServiceSelection(this);
};
document.getElementById('volume').onchange = function () {
    handleServiceSelection(this);
};

// Event listener for the fetch pricing button
fetchPricingBtn.onclick = async function () {
    const provider = providerSelect.value;
    const serviceName = selectedService.innerText.replace('Selected Service: ', '');

    switch (provider) {
        case 'AWS':
            await fetchAWSPricing(serviceName);
            break;
        case 'Azure':
            await fetchAzurePricing(serviceName);
            break;
        case 'GCP':
            await fetchGCPricing(serviceName);
            break;
        default:
            console.error('Unknown provider selected.');
    }
};

// Fetch AWS pricing
async function fetchAWSPricing(_serviceName) {
    const awsPricingURL = `cloud/priceaws.json`;

    try {
        const response = await fetch(awsPricingURL);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();

        const awsServices = data.AWS.services;

        let ec2Price = _serviceName === 'AmazonEC2' ? awsServices.AmazonEC2.pricePerHour || 'N/A' : null;
        let s3Price = _serviceName === 'AmazonS3' ? awsServices.AmazonS3.pricePerGB || 'N/A' : null;
        let rdsPrice = _serviceName === 'AmazonRDS' ? awsServices.AmazonRDS.pricePerHour || 'N/A' : null;
        let albPrice = _serviceName === 'AmazonElasticLoadBalancing' ? awsServices.AmazonElasticLoadBalancing.pricePerGBProcessed || 'N/A' : null;
        let r53Price = _serviceName === 'AmazonRoute53' ? awsServices.AmazonRoute53.DNSQueryPrice || 'N/A' : null;
        let avpcPrice = _serviceName === 'AmazonVPC' ? awsServices.AmazonVPC.pricePerVPNConnection || 'N/A' : null;
        let ebsPrice = _serviceName === 'AmazonEBS' ? awsServices.AmazonEBS.pricePerGB || 'N/A' : null;
        let eksPrice = _serviceName === 'AmazonEKS' ? awsServices.AmazonEKS.pricePerNode || 'N/A' : null;
        updatePricingOutput({
            provider: 'AWS',
            ec2Price,
            s3Price,
            rdsPrice,
            albPrice,
            r53Price,
            avpcPrice,
            ebsPrice,
            eksPrice,
            _serviceName
        });
    } catch (error) {
        console.error('Error fetching AWS pricing:', error);
    }
}

// Fetch Azure pricing
async function fetchAzurePricing(_serviceName) {
    const azurePricingURL = `cloud/pricesazure.json`;

    try {
        const [responseVM, responseBlob, responseSQL,responseLoad,responseDNS,responseDisks,responseNetwork,responseAzureKubernetes,] = await Promise.all([
            fetch(`${azurePricingURL}?$filter=serviceName eq 'Virtual Machines' and armRegionName eq 'eastus'`),
            fetch(`${azurePricingURL}?$filter=serviceName eq 'Storage' and armRegionName eq 'eastus'`),
            fetch(`${azurePricingURL}?$filter=serviceName eq 'LoadBalancer' and armRegionName eq 'eastus'`),
            fetch(`${azurePricingURL}?$filter=serviceName eq 'AzureDNS' and armRegionName eq 'eastus'`),
            fetch(`${azurePricingURL}?$filter=serviceName eq 'ManagedDisks' and armRegionName eq 'eastus'`),
            fetch(`${azurePricingURL}?$filter=serviceName eq 'VirtualNetwork' and armRegionName eq 'eastus'`),
            fetch(`${azurePricingURL}?$filter=serviceName eq 'AzureKubernetesService' and armRegionName eq 'eastus'`),
            fetch(`${azurePricingURL}?$filter=serviceName eq 'SQL Database' and armRegionName eq 'eastus'`)
        ]);

        const dataVM = await responseVM.json();
        const dataBlob = await responseBlob.json();
        const dataSQL = await responseSQL.json();
        const dataLoad = await responseLoad.json();
        const dataDNS = await responseDNS.json();
        const dataDisks = await responseDisks.json();
        const dataNetwork = await responseNetwork.json();
        const dataAzureKubernetes = await responseAzureKubernetes.json();

        let vmPrice = _serviceName === 'Virtual Machines' ? dataVM.Items[0]?.retailPrice || 'N/A' : null;
        let blobPrice = _serviceName === 'Storage' ? dataBlob.Items[0]?.retailPrice || 'N/A' : null;
        let sqlPrice = _serviceName === 'SQL Database' ? dataSQL.Items[0]?.retailPrice || 'N/A' : null;
        let loadPrice = _serviceName === 'LoadBalancer' ? dataLoad.Items[0]?.retailPrice || 'N/A' : null;
        let dnsPrice = _serviceName === 'AzureDNS' ? dataDNS.Items[0]?.retailPrice || 'N/A' : null;
        let ebsPrice = _serviceName === 'Azure volume' ? dataDisks.Items[0]?.retailPrice || 'N/A' : null;
        let networkPrice = _serviceName === 'VirtualNetwork' ? dataNetwork.Items[0]?.retailPrice || 'N/A' : null;
        let aksPrice = _serviceName === 'AKS' ? dataAzureKubernetes.Items[0]?.retailPrice || 'N/A' : null;

        updatePricingOutput({
            provider: 'Azure',
            vmPrice,
            blobPrice,
            sqlPrice,
            loadPrice,
            dnsPrice,
            networkPrice,
            ebsPrice,
            aksPrice,
            _serviceName
        });
    } catch (error) {
        console.error('Error fetching Azure pricing:', error);
    }
}

// Fetch Google Cloud pricing
async function fetchGCPricing(_serviceName) {
    const gcpPricingURL = 'cloud/pricelistgcp.json';

    try {
        const response = await fetch(gcpPricingURL);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();

        const gcpServices = data.GCP.services;

        let computePrice = _serviceName === 'Compute Engine' ? gcpServices.ComputeEngine.pricePerHour || 'N/A' : null;
        let storagePrice = _serviceName === 'Cloud Storage' ? gcpServices.CloudStorage.pricePerGB || 'N/A' : null;
        let sqlPrice = _serviceName === 'Cloud SQL' ? gcpServices.CloudSQL.pricePerHour || 'N/A' : null;
        let gvolumePrice = _serviceName === 'GCP volume' ? gcpServices.PersistentDisk.pricePerGB || 'N/A' : null;
        let glbPrice = _serviceName === 'CloudLoadBalancing' ? gcpServices.CloudLoadBalancing.pricePerGBProcessed || 'N/A' : null;
        let gdnsPrice = _serviceName === 'CloudDNS' ? gcpServices.CloudDNS.DNSQueryPrice || 'N/A' : null;
        let gvpPrice = _serviceName === 'VirtualPrivateCloud' ? gcpServices.VirtualPrivateCloud.pricePerVPNConnection || 'N/A' : null;
        let gkePrice = _serviceName === 'GKE' ? gcpServices.KubernetesEngine.pricePerNode || 'N/A' : null;

        updatePricingOutput({
            provider: 'Google Cloud',
            computePrice,
            storagePrice,
            sqlPrice,
            gkePrice,
            gvpPrice,
            gdnsPrice,
            glbPrice,
            gvolumePrice,
            _serviceName
        });
    } catch (error) {
        console.error('Error fetching Google Cloud pricing:', error);
    }
}

function updatePricingOutput({ provider, ec2Price, s3Price, rdsPrice, vmPrice, blobPrice, sqlPrice, computePrice, storagePrice, gvolumePrice, glbPrice, gdnsPrice, gvpPrice, gkePrice, loadPrice, dnsPrice, networkPrice, aksPrice, albPrice, r53Price, avpcPrice, ebsPrice, eksPrice, serviceName }) {
    const outputElement = document.getElementById('pricingOutput');
    outputElement.innerHTML = `<p><strong>${provider} Pricing for ${serviceName}:</strong></p>`;

    if (ec2Price) outputElement.innerHTML += `<p>EC2: ${ec2Price}</p>`;
    if (s3Price) outputElement.innerHTML += `<p>S3: ${s3Price}</p>`;
    if (rdsPrice) outputElement.innerHTML += `<p>RDS: ${rdsPrice}</p>`;
    if (albPrice) outputElement.innerHTML += `<p>LB: ${albPrice}</p>`;
    if (eksPrice) outputElement.innerHTML += `<p>EKS: ${eksPrice}</p>`;
    if (r53Price) outputElement.innerHTML += `<p>R53: ${r53Price}</p>`;
    if (avpcPrice) outputElement.innerHTML += `<p>VPC: ${avpcPrice}</p>`;
    if (ebsPrice) outputElement.innerHTML += `<p>EBS: ${ebsPrice}</p>`;
    if (vmPrice) outputElement.innerHTML += `<p>Virtual Machine: ${vmPrice}</p>`;
    if (blobPrice) outputElement.innerHTML += `<p>Blob Storage: ${blobPrice}</p>`;
    if (sqlPrice) outputElement.innerHTML += `<p>SQL Database: ${sqlPrice}</p>`;
    if (loadPrice) outputElement.innerHTML += `<p>LoadBalancer: ${loadPrice}</p>`;
    if (aksPrice) outputElement.innerHTML += `<p>AKS: ${aksPrice}</p>`;
    if (networkPrice) outputElement.innerHTML += `<p>VPC: ${networkPrice}</p>`;
    if (dnsPrice) outputElement.innerHTML += `<p>DNS: ${dnsPrice}</p>`;
    if (computePrice) outputElement.innerHTML += `<p>Compute Engine: ${computePrice}</p>`;
    if (storagePrice) outputElement.innerHTML += `<p>Cloud Storage: ${storagePrice}</p>`;
    if (gkePrice) outputElement.innerHTML += `<p>GKE: ${gkePrice}</p>`;
    if (gvpPrice) outputElement.innerHTML += `<p>GVP: ${gvpPrice}</p>`;
    if (gdnsPrice) outputElement.innerHTML += `<p>DNS: ${gdnsPrice}</p>`;
    if (gvolumePrice) outputElement.innerHTML += `<p>Volume: ${gvolumePrice}</p>`;
    if (glbPrice) outputElement.innerHTML += `<p>LoadBalancer: ${glbPrice}</p>`;
}
