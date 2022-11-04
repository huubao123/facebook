// // Import the Google Cloud client library
// const { BigQuery } = require('@google-cloud/bigquery');
//
// module.exports = async function queryStackOverflow(basic_fields, custom_fields) {
//   // Queries a public Stack Overflow dataset.
//   datajson = { basic_fields: basic_fields, custom_fields: custom_fields };
//   // Create a client
//   const bigqueryClient = new BigQuery({
//     type: 'service_account',
//     project_id: 'customer-mangoads',
//     private_key_id: '669ca6d67d1b68865c65bcff87ef9a7730092edf',
//     private_key:
//       '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC9loNJ5hmG1shu\nYTLZ+MA1aFO8fFmIMf19w1y+wx+x0eCQSl1szBTyTPkIoDFwcfDP+P4XinVB2zuw\notwSDUyerBCXyCPAUrRWXVATvN16cxJBdlCGTtgf9wGb+UU3nl3V2YBsta14I6fY\nA4iy/V1yIrmSx2dCymoM3ILyaLPRWaNVP0lByLjLID+JAOk0kF4Z+KKVC1DbgKdY\nVzSz2TVd2/kKfHYGlluiu1IN9sjnrbKAlfZ7eVUR5QDXSxGEPAiW+mD4i3moxho0\nPzFhNaeVOG/Xc6JewD+NT3fdJsazUDE9jfQFwbPbMz4w7KYgzUYtsbwE2giOs2tm\nOSeZ44PZAgMBAAECggEADy5O73srFpq6vGnwkDckrvIeaGSdp7P3DBu5YLYPouW/\nIVavEe/qindi5o+rPcmF4qVZtUlbN82GA1AbJp/lf3wgLQMz56nHsnWw3I++PVib\nAN5oNsT39eFJwfNNGVXHRkEvESVgEVNrlHa9+rUihynkKa5pZJYANWzv2FjNc0ki\nozP5aRvhB0fklUi3qZhKYilWV0h8XXWB0ugvvxTRqTU/Lm90QgwbN5Jzjz4aMMhg\nj+PmN/73ifd79hLXpQGywAqgDk8qPdnnYZoPANRjByLesfUheJh6M2+toFVShNT2\nEOPshcKDuReN2PQ9JpA8+hFEYVl4vcCoW+i66ejADQKBgQDmoo6KwwfYJzAidLsH\no6xF4siP7iCVB8Y6sfhZndDqOpBSKa9MIZ/5loWP15iaBMK1FHxFIbKJWpe7bSGU\nbDXx6gCBXkwS1jTnneCODgw7Ry1merJ/yOlNphNCn6io6SJ4iBnFWz7NoO/uHP7o\nl9f0cUpb899FW9Sf100QFVni/QKBgQDScEqi2wlQMul5O8W7NRvBwBkh86YHL998\nTRj0amlJS4V9QevgDKElgwAHt+o6y4X0wzEXTLfUdqz5bsHZ4tiS6e+vbsV6jewz\n6pu7u+ElZd3GO7/I7HS+LF3HmauW0xg5uOGeW4e3q+B1F2Z15RcM9i/15aSrKYiH\njUJfdzABDQKBgQDf/3OXu7ILsovieyMHWWTA/3CxsaJ9e+6AJUfCqi80vqpa0leK\nBoJcI2AXA1sYA5Wjz4CemArRsmX5yBU8FRkTmqThANe718XMSp7E+UnR7OBgTry8\ntUI6gxjjtTNW0g8Dp5P4BRXrGurMhebhulAo/jstMZ9gur64e6BCBaqmdQKBgQDO\nPEapPEjwVDUEH1Q1mGLPi1gWMhbwzDYWN+jRAMiWkHEOxOBJ/5aekLgi2Fexr2xk\n6DbgQsuWaYg0HBvXUb42nRXNtJ3M8fIfHznozsRkRmUGtd/LJhFznz95Ml07vz3q\ntApJjCKCGuwrVPeRaycgCNYQAzNSm622SvZVYRWmsQKBgHOunV14cnbByBMbTlwa\ncMEFpuelAHGGDGVdrYX3mNbCb0E5p7OyxDHkF7qIZfazSlhE4ykyTXvRT5dphp3V\nbFSeZMblLEU763WMUHYxFwnJV/kXtn1LTVPAZ/wPlZeR05MlGI7OofKuZWYamaFy\n0oUT06X7RZHw4bqg6ww1EWTs\n-----END PRIVATE KEY-----\n',
//     client_email: 'crawler@customer-mangoads.iam.gserviceaccount.com',
//     client_id: '108150431662166265841',
//     auth_uri: 'https://accounts.google.com/o/oauth2/auth',
//     token_uri: 'https://oauth2.googleapis.com/token',
//     auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
//     client_x509_cert_url:
//       'https://www.googleapis.com/robot/v1/metadata/x509/crawler%40customer-mangoads.iam.gserviceaccount.com',
//   });
//   const schema = 'Name:string, Age:integer, Weight:float, IsMagic:boolean';
//   // The SQL query to run
//   const TableObjectHeader = {
//     tableReference: {
//       datasetId: '4ebd020883285d698c44ec50939c0967',
//       tableId: 'facebook',
//     },
//   };
//
//   // Create a new table in the dataset
//   const table = bigqueryClient
//     .dataset(TableObjectHeader['tableReference']['datasetId'])
//     .table(TableObjectHeader['tableReference']['tableId']);
//   table.insert(datajson, function (err, response) {
//     console.log('error:' + JSON.stringify(err));
//     console.log('response:' + JSON.stringify(response));
//   });
// };
