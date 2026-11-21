# HTTP

> Hyper text transfer protocol 

one of the common protorcal for clienet server arc

Http have some common req type 

1.GET
2.POST
3.PUT
4.PATCH 
5.DELETE

so this are very common http req method we are using to hit req this are not the some structure to follw 
they give some symatic 

## idompotent vs Non-idempotenet 
by hitting same req we can have the same result
like

GET
PUT
DELETE

post is not idemptotnt req

## OPTION

it is primeary used for the avoid cross origin policy of borwser 

borwser generaly use something called as only allow same origin url 
like if we have exmpapl.com then browser expect to get the server repose from the same origin 
but that does not happen many times so we have something called as 

> access-contorl allow origin

noraml req 

the flow is simple the idea behind is that 
