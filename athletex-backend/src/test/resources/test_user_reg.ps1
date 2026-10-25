$body = @{
    fullName = "Abhinand"
    email = "abhinandma86@gmail.com"
    phone = "9876543210"
    password = "Abhinand@123"
    role = "ATHLETE"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method Post -ContentType "application/json" -Body $body
    Write-Host "Register result: $res"
} catch {
    Write-Host "Register error: $($_.Exception.Message)"
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "Body: $($reader.ReadToEnd())"
}
